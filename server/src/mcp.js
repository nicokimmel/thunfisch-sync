import YouTube from "./youtube.js"
import SponsorBlock from "./sponsorblock.js"
import {
    validateVideoId,
    validateSeekTime,
    validateQueueIndex,
    validateQueueMove
} from "./validate.js"

export default class MCP {

    static PROTOCOL_VERSION = "2025-11-25"

    constructor(connection) {
        this.io = connection.get()
        this.youtube = new YouTube()
        this.sponsorBlock = new SponsorBlock()

        this.setup()
    }

    setup() {
        this.methods = {
            "initialize": (room, params, callback) => {
                callback({
                    protocolVersion: params.protocolVersion || MCP.PROTOCOL_VERSION,
                    capabilities: { tools: {} },
                    serverInfo: { name: "thunfisch-sync", version: "1.0.0" }
                })
            },
            "ping": (room, params, callback) => {
                callback({})
            },
            "tools/list": (room, params, callback) => {
                callback({
                    tools: Object.keys(this.tools).map((name) => ({
                        name: name,
                        description: this.tools[name].description,
                        inputSchema: this.tools[name].inputSchema
                    }))
                })
            },
            "tools/call": (room, params, callback) => {
                const done = (error) => {
                    callback({
                        content: [{ type: "text", text: error || JSON.stringify(this.state(room)) }],
                        isError: Boolean(error)
                    })
                }

                if (!Object.hasOwn(this.tools, params.name)) {
                    done("Unknown tool.")
                    return
                }
                this.tools[params.name].run(room, params.arguments || {}, done)
            }
        }

        this.tools = {
            "get-room": {
                description: "Returns the current video, playback time and queue of the room. All times are in seconds, a duration of -1 is a live stream.",
                inputSchema: { type: "object", properties: {} },
                run: (room, args, callback) => {
                    callback()
                }
            },
            "play-video": {
                description: "Plays a YouTube video immediately.",
                inputSchema: {
                    type: "object",
                    properties: {
                        video: { type: "string", description: "YouTube video URL or video id" }
                    },
                    required: ["video"]
                },
                run: (room, args, callback) => {
                    this.load(args.video, (videoList) => {
                        if (videoList.length === 0) {
                            callback("Video not found.")
                            return
                        }

                        room.play(videoList[0])
                        this.io.in(room.id).emit("video", room.player, room.video)

                        this.sponsorBlock.load(room.video.id, (segmentList) => {
                            room.player.sponsorBlock.segments = segmentList
                        })
                        callback()
                    })
                }
            },
            "queue-add": {
                description: "Adds a YouTube video to the end of the queue.",
                inputSchema: {
                    type: "object",
                    properties: {
                        video: { type: "string", description: "YouTube video URL or video id" }
                    },
                    required: ["video"]
                },
                run: (room, args, callback) => {
                    this.load(args.video, (videoList) => {
                        if (videoList.length === 0) {
                            callback("Video not found.")
                            return
                        }

                        room.add(videoList)
                        this.io.in(room.id).emit("queue", room.queue)
                        callback()
                    })
                }
            },
            "queue-move": {
                description: "Moves a video in the queue to another position. Indices start at 0.",
                inputSchema: {
                    type: "object",
                    properties: {
                        from: { type: "integer", description: "Current index of the video" },
                        to: { type: "integer", description: "New index of the video" }
                    },
                    required: ["from", "to"]
                },
                run: (room, args, callback) => {
                    let { from, to } = args
                    const result = validateQueueMove(from, to, room.queue.length)
                    if (!result.valid) {
                        callback(result.error)
                        return
                    }

                    if (to < 0) { to = 0 }
                    if (to > room.queue.length - 1) { to = room.queue.length - 1 }
                    if (from !== to) {
                        room.move(from, to)
                        this.io.in(room.id).emit("queue", room.queue)
                    }
                    callback()
                }
            },
            "queue-delete": {
                description: "Removes a video from the queue. Indices start at 0.",
                inputSchema: {
                    type: "object",
                    properties: {
                        index: { type: "integer", description: "Index of the video" }
                    },
                    required: ["index"]
                },
                run: (room, args, callback) => {
                    const result = validateQueueIndex(args.index)
                    if (!result.valid) {
                        callback(result.error)
                        return
                    }

                    room.remove(args.index)
                    this.io.in(room.id).emit("queue", room.queue)
                    callback()
                }
            },
            "play": {
                description: "Resumes the current video.",
                inputSchema: { type: "object", properties: {} },
                run: (room, args, callback) => {
                    room.player.playing = true
                    this.io.in(room.id).emit("play", room.player.time)
                    callback()
                }
            },
            "pause": {
                description: "Pauses the current video.",
                inputSchema: { type: "object", properties: {} },
                run: (room, args, callback) => {
                    room.player.playing = false
                    this.io.in(room.id).emit("pause", room.player.time)
                    callback()
                }
            },
            "seek": {
                description: "Jumps to a position in the current video.",
                inputSchema: {
                    type: "object",
                    properties: {
                        time: { type: "number", description: "Position in seconds" }
                    },
                    required: ["time"]
                },
                run: (room, args, callback) => {
                    const result = validateSeekTime(args.time)
                    if (!result.valid) {
                        callback(result.error)
                        return
                    }

                    let time = Math.floor(args.time)
                    if (time < 0) { time = 0 }
                    if (room.video.duration > 0 && time > room.video.duration) { time = room.video.duration }
                    room.player.time = time
                    this.io.in(room.id).emit("seek", room.player.time)
                    callback()
                }
            }
        }
    }

    handle(room, message, callback) {
        // Notifications don't get a response
        if (message.id === undefined) {
            callback()
            return
        }

        if (!Object.hasOwn(this.methods, message.method)) {
            callback({
                jsonrpc: "2.0",
                id: message.id,
                error: { code: -32601, message: "Method not found." }
            })
            return
        }

        this.methods[message.method](room, message.params || {}, (result) => {
            callback({
                jsonrpc: "2.0",
                id: message.id,
                result: result
            })
        })
    }

    load(video, callback) {
        if (typeof video !== "string") {
            callback([])
            return
        }

        // Only direct video links or ids, no search
        const result = this.youtube.parse(video)
        const videoId = result.type === "v" ? result.value : video
        if (!validateVideoId(videoId).valid) {
            callback([])
            return
        }
        this.youtube.getVideo(videoId, callback)
    }

    state(room) {
        return {
            video: this.summary(room.video),
            time: room.player.time,
            playing: room.player.playing,
            queue: room.queue.map((video, index) => ({ index: index, ...this.summary(video) }))
        }
    }

    summary(video) {
        return {
            id: video.id,
            title: video.title,
            channel: video.channel.name,
            duration: video.duration
        }
    }
}
