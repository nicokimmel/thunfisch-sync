import request from "request"
import {
    validateHookUrl,
    validateHookEvents
} from "./validate.js"

export default class Webhook {

    static EVENTS = ["video", "play", "pause", "seek", "queue", "speed", "loop", "sponsorblock", "remove"]
    static MAX_HOOKS = 10
    static TIMEOUT = 5000

    constructor() {
        // Keyed by room object, so hooks are gone together with their room
        this.list = new WeakMap()
    }

    add(room, url, events) {
        let result = validateHookUrl(url)
        if (!result.valid) { return result }
        result = validateHookEvents(events, Webhook.EVENTS)
        if (!result.valid) { return result }

        // Adding the same url again only updates its events
        const hookList = this.get(room).filter((hook) => hook.url !== url)
        if (hookList.length >= Webhook.MAX_HOOKS) {
            return { valid: false, error: `Room can't have more than ${Webhook.MAX_HOOKS} hooks` }
        }

        hookList.push({ url: url, events: events || Webhook.EVENTS })
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
            // Without callback request would throw on errors, failed hooks are ignored
            request.post(hook.url, { json: { event: event, room: room }, timeout: Webhook.TIMEOUT }, () => {})
        })
    }
}
