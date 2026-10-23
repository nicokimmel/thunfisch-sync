import request from "request"
import dns from "node:dns"
import { BlockList, isIP } from "node:net"
import { parse } from "node:url"
import {
    validateHookUrl,
    validateHookEvents,
    validateHookHeaders,
    validateHookThreshold
} from "./validate.js"

export default class Webhook {

    static EVENTS = ["video", "play", "pause", "seek", "queue", "speed", "loop", "sponsorblock", "remove"]
    static MAX_HOOKS = 10
    static TIMEOUT = 5000
    static PRIVATE_NETWORKS = ["0.0.0.0/8", "10.0.0.0/8", "127.0.0.0/8", "169.254.0.0/16", "172.16.0.0/12", "192.168.0.0/16", "::/128", "::1/128", "fc00::/7", "fe80::/10"]

    constructor() {
        // Keyed by room object, so hooks are gone together with their room
        this.list = new WeakMap()

        // Hooks must not reach the local network of the server
        this.blockList = new BlockList()
        Webhook.PRIVATE_NETWORKS.forEach((network) => {
            const [address, prefix] = network.split("/")
            this.blockList.addSubnet(address, Number(prefix), isIP(address) === 6 ? "ipv6" : "ipv4")
        })
    }

    add(room, url, events, headers, threshold) {
        let result = validateHookUrl(url)
        if (!result.valid) { return result }
        result = validateHookEvents(events, Webhook.EVENTS)
        if (!result.valid) { return result }
        result = validateHookHeaders(headers)
        if (!result.valid) { return result }
        result = validateHookThreshold(threshold)
        if (!result.valid) { return result }

        // Adding the same url again updates its configuration
        const hookList = this.get(room).filter((hook) => hook.url !== url)
        if (hookList.length >= Webhook.MAX_HOOKS) {
            return { valid: false, error: `Room can't have more than ${Webhook.MAX_HOOKS} hooks` }
        }

        hookList.push({ url: url, events: events || Webhook.EVENTS, headers: headers, threshold: threshold })
        this.list.set(room, hookList)
        return { valid: true }
    }

    remove(room, url) {
        this.list.set(room, this.get(room).filter((hook) => hook.url !== url))
    }

    get(room) {
        return this.list.get(room) || []
    }

    send(room, event) {
        this.get(room).forEach((hook) => {
            if (!hook.events.includes(event)) { return }
            if (event === "queue" && hook.threshold !== undefined && room.queue.length >= hook.threshold) { return }
            // Ip addresses are connected without lookup, so they are checked here
            if (this.isPrivate(parse(hook.url).hostname)) { return }
            // Without callback request would throw on errors, failed hooks are ignored
            request.post(hook.url, { headers: hook.headers, json: { event: event, room: room }, timeout: Webhook.TIMEOUT, lookup: this.lookup.bind(this) }, () => {})
        })
    }

    isPrivate(address) {
        const type = isIP(address)
        return type !== 0 && this.blockList.check(address, type === 6 ? "ipv6" : "ipv4")
    }

    // Checks the resolved addresses, so the checked address is also the connected one
    lookup(hostname, options, callback) {
        dns.lookup(hostname, options, (err, address, family) => {
            if (err) { return callback(err) }
            const addressList = Array.isArray(address) ? address : [{ address: address }]
            if (addressList.some((entry) => this.isPrivate(entry.address))) {
                return callback(new Error("Hook address is private"))
            }
            callback(null, address, family)
        })
    }
}
