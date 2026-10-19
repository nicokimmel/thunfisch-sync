import request from "request"
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

    constructor() {
        // Keyed by room object, so hooks are gone together with their room
        this.list = new WeakMap()
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
            // Without callback request would throw on errors, failed hooks are ignored
            request.post(hook.url, { headers: hook.headers, json: { event: event, room: room }, timeout: Webhook.TIMEOUT }, () => {})
        })
    }
}
