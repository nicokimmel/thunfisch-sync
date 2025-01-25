import fs from "fs"

export class Room {
    constructor(roomId, sticky) {
        this.id = roomId
        this.viewer = 0
        this.sticky = sticky || false
        this.idle = 0

        this.player = {
            playing: true,
            time: 126,
            speed: 1.0,
            loop: false,
            sponsorBlock: {
                enabled: true,
                segments: []
            }
        }

        this.video = {
            id: "p5WxxAAh-1U",
            title: "Betta splendens",
            channel: {
                id: "#",
                name: "Thunfisch Sync",
                subscribers: 187,
                image: "https://sync.thunfisch.lol/img/tuna_sync.png"
            },
            duration: 4021,
            tags: ["Thunfisch Sync", "Modern", "Simple", "Watch", "Listen", "Relax", "Together", "🐟"],
            views: 1337,
        }

        this.queue = []
    }

    play(videoId) {
        this.player.time = 0
        this.player.playing = true
        this.video = videoId
    }

    next() {
        this.player.time = 0

        if (this.player.loop) {
            this.player.playing = true
            return
        }

        const nextVideo = this.queue.shift()
        if (!nextVideo) {
            this.player.playing = false
            return
        }
        this.player.playing = true
        this.video = nextVideo
    }

    clear() {
        this.queue = []
    }

    add(videoList) {
        this.queue = this.queue.concat(videoList)
    }

    remove(index) {
        if (this.queue[index]) {
            this.queue.splice(index, 1)
        }
    }

    move(from, to) {
        let temp = this.queue[from]
        this.queue.splice(from, 1)
        if (to < 0) {
            this.queue.unshift(temp)
        } else {
            this.queue.splice(to, 0, temp)
        }
    }

    shuffle() {
        let j, x, i
        for (i = this.queue.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1))
            x = this.queue[i]
            this.queue[i] = this.queue[j]
            this.queue[j] = x
        }
        return this.queue
    }
}

export class RoomList {

    static ROOM_ID_LENGTH = 8
    static ROOM_FILE = "rooms.json"
    static VALID_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"

    constructor() {
        this.list = {}

        this.load()
    }

    create(roomId, sticky) {
        if (this.exists(roomId)) {
            return
        }

        if (!roomId) {
            roomId = this.random()
        }

        let room = new Room(roomId, sticky)
        this.list[roomId] = room
        return room
    }

    get(roomId) {
        return this.list[roomId]
    }

    exists(roomId) {
        if (this.list[roomId]) {
            return true
        }
        return false
    }

    valid(roomId) {
        const regex = new RegExp(`^[${RoomList.VALID_CHARACTERS}]{8}$`)
        return regex.test(roomId)
    }

    remove(roomId) {
        delete this.list[roomId]
    }

    forEach(callback) {
        Object.keys(this.list).forEach((roomId) => {
            callback(this.list[roomId])
        })
    }

    load() {
        try {
            if (!fs.existsSync(RoomList.ROOM_FILE)) {
                fs.writeFileSync(RoomList.ROOM_FILE, JSON.stringify(["STANDARD"]), { flag: "w" })
            }

            const buffer = fs.readFileSync(RoomList.ROOM_FILE)
            if (buffer.length == 0) {
                return
            }

            const stickyRooms = JSON.parse(buffer)
            for (let i = 0; i < stickyRooms.length; i++) {
                let roomId = stickyRooms[i]
                if (!this.exists(roomId)) {
                    this.create(roomId, true)
                }
            }
        } catch (error) {

        }

    }

    save() {
        let stickyRooms = []
        this.forEach((room) => {
            if (room.sticky) {
                stickyRooms.push(room.id)
            }
        })
        fs.writeFileSync(RoomList.ROOM_FILE, JSON.stringify(stickyRooms))
    }

    random() {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
        let randomId = ""
        for (let i = 0; i < RoomList.ROOM_ID_LENGTH; i++) {
            randomId += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        while (this.list[randomId]) {
            randomId = random()
        }
        return randomId
    }
}