export default class ExitHelper {
    
    static SIGNALS = ["exit", "SIGINT", "SIGTERM", "SIGUSR1", "SIGUSR2", "uncaughtException"]
    
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
        ExitHelper.SIGNALS.forEach(signal => process.on(signal, this.onExit.bind(this)))
    }
}