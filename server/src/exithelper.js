export default class ExitHelper {
    constructor(roomList) {
        this.rooms = roomList
        this.events()
    }
    
    onExit() {
        this.rooms.save()
        process.exit(0)
    }
    
    events() {
        process.stdin.resume()
        process.on("exit", this.onExit.bind(this))
        process.on("SIGINT", this.onExit.bind(this))
        process.on("SIGUSR1", this.onExit.bind(this))
        process.on("SIGUSR2", this.onExit.bind(this))
        process.on("uncaughtException", this.onExit.bind(this))
    }
}