import { Server } from "socket.io"

import YouTube from "./youtube.js"
import SponsorBlock from "./sponsorblock.js"
import { validateRoomId, validateSeekTime, validateSpeed, validateSearchTerm, validateVideoList, validateQueuePos, validateQueueIndex, validateQueueMove } from "./validate.js"

export default class Connection {

    constructor(server, roomList) {
        this.io = new Server(server, {
            connectionStateRecovery: {}
        })
        this.rooms = roomList
        this.youtube = new YouTube()
        this.sponsorBlock = new SponsorBlock()

        this.start()
    }

    start() {
        this.io.on("connection", (client) => {
            const ip = client.handshake.headers["x-real-ip"] || client.request.connection.remoteAddress
            let room = null

            client.on("join", (roomId) => {
                if (!validateRoomId(roomId).valid) { return }
                room = this.rooms.get(roomId)
                if (!room) {
                    // Room might be gone after reconnect
                    client.emit("kick")
                    return
                }
                client.join(room.id)
                client.emit("join", room)
                room.viewer = this.io.sockets.adapter.rooms.get(room.id).size
                this.io.in(room.id).emit("viewer", room.viewer)
            })

            client.on("disconnecting", () => {
                if (!room) { return }
                room.viewer = room.viewer - 1
                this.io.in(room.id).emit("viewer", room.viewer)
            })

            client.on("play", () => {
                if (!room) { return }
                room.player.playing = true
                this.io.in(room.id).emit("play", room.player.time)
            })

            client.on("pause", () => {
                if (!room) { return }
                room.player.playing = false
                this.io.in(room.id).emit("pause", room.player.time)
            })

            client.on("seek", (time) => {
                if (!room) { return }
                if (!validateSeekTime(time).valid) { return }
                time = Math.floor(time)
                if (time < 0) { time = 0 }
                if (room.video.duration > 0 && time > room.video.duration) { time = room.video.duration }
                room.player.time = time
                this.io.in(room.id).emit("seek", room.player.time)
            })

            client.on("speed", (speed) => {
                if (!room) { return }
                if (!validateSpeed(speed).valid) { return }
                room.player.speed = speed
                this.io.in(room.id).emit("speed", room.player.speed)
            })

            client.on("loop", () => {
                if (!room) { return }
                room.player.loop = !room.player.loop
                this.io.in(room.id).emit("loop", room.player.loop)
            })

            client.on("sponsorblock", () => {
                if (!room) { return }
                room.player.sponsorBlock.enabled = !room.player.sponsorBlock.enabled
                this.io.in(room.id).emit("sponsorblock", room.player.sponsorBlock.enabled)
            })

            client.on("search", (searchTerm) => {
                if (!room) { return }
                if (!validateSearchTerm(searchTerm).valid) { return }
                const result = this.youtube.parse(searchTerm)
                if (result.type === "s") {
                    this.youtube.getSearch(result.value, (videoList) => {
                        client.emit("search", videoList)
                    })
                } else if (result.type === "v") {
                    this.youtube.getVideo(result.value, (videoList) => {
                        client.emit("search", videoList)
                    })
                } else if (result.type === "p") {
                    this.youtube.getPlaylist(result.value, (videoList) => {
                        client.emit("search", videoList, result.type)
                    })
                }
            })

            client.on("video", (videoList, queuePos) => {
                if (!room) { return }
                if (!validateVideoList(videoList).valid) { return }
                if (!validateQueuePos(queuePos).valid) { return }
                if (queuePos >= 0) {
                    room.remove(queuePos)
                    this.io.in(room.id).emit("queue", room.queue)
                }

                room.play(videoList[0])
                this.io.in(room.id).emit("video", room.player, room.video)

                this.sponsorBlock.load(room.video.id, (segmentList) => {
                    room.player.sponsorBlock.segments = segmentList
                })
            })

            client.on("queue-add", (videoList) => {
                if (!room) { return }
                if (!validateVideoList(videoList).valid) { return }
                room.add(videoList)
                this.io.in(room.id).emit("queue", room.queue)
            })

            client.on("queue-remove", (index) => {
                if (!room) { return }
                if (!validateQueueIndex(index).valid) { return }
                room.remove(index)
                this.io.in(room.id).emit("queue", room.queue)
            })

            client.on("queue-move", (from, to) => {
                if (!room) { return }
                if (!validateQueueMove(from, to, room.queue.length).valid) { return }
                if (to < 0) { to = 0; }
                if (to > room.queue.length - 1) { to = room.queue.length - 1 }
                if (from === to) { return }
                room.move(from, to)
                this.io.in(room.id).emit("queue", room.queue)
            })

            client.on("queue-clear", () => {
                if (!room) { return }
                room.clear()
                this.io.in(room.id).emit("queue", room.queue)
            })

            client.on("queue-shuffle", () => {
                if (!room) { return }
                room.shuffle()
                this.io.in(room.id).emit("queue", room.queue)
            })
        })
    }

    get() {
        return this.io
    }
}