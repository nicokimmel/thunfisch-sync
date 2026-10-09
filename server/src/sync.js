
import SponsorBlock from "./sponsorblock.js"

export default class Sync {

    static TICK_SPEED = 1000
    static MAX_IDLE_TIME = 300

    constructor(connection, roomList, webhook) {
        this.io = connection.get()
        this.rooms = roomList
        this.webhook = webhook
        this.sponsorBlock = new SponsorBlock()
    }

    loop() {
        setInterval(() => {
            this.rooms.forEach((room) => {
                if (room.viewer === 0) {
                    if (room.idle >= Sync.MAX_IDLE_TIME) {
                        if (!room.sticky) {
                            this.rooms.remove(room.id)
                        } else {
                            room.player.playing = false
                        }
                    } else {
                        room.idle = room.idle + 1
                    }
                } else {
                    room.idle = 0
                }

                if (!room.player.playing) {
                    return
                }

                if (room.video.duration < 0) {
                    return
                }

                if (room.player.sponsorBlock.enabled) {
                    const seekTime = this.sponsorBlock.check(room.player.time, room.player.sponsorBlock.segments)
                    if (seekTime) {
                        room.player.time = seekTime
                        this.io.in(room.id).emit("seek", seekTime)
                        this.webhook.send(room, "seek")
                    }
                }

                room.player.time = room.player.time + parseFloat(room.player.speed)
                if (room.player.time > room.video.duration) {
                    room.next()
                    this.io.in(room.id).emit("video", room.player, room.video)
                    this.webhook.send(room, "video")
                    this.io.in(room.id).emit("queue", room.queue)
                    this.webhook.send(room, "queue")

                    this.sponsorBlock.load(room.video.id, (segmentList) => {
                        room.player.sponsorBlock.segments = segmentList
                    })
                }

                this.io.in(room.id).emit("tick", room.player.playing, room.player.time)
            })
        }, Sync.TICK_SPEED)
    }
}