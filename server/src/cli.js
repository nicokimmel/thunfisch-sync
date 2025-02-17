import readline from "readline"

export default class CLI {
    constructor(roomList) {
        this.rooms = roomList
        this.setup()
    }

    logo() {
        console.log("")
        console.log(" ░▒▓███████▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░ ░▒▓██████▓▒░  ")
        console.log(" ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░")
        console.log(" ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░       ")
        console.log("  ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░       ")
        console.log("        ░▒▓█▓▒░  ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░       ")
        console.log("        ░▒▓█▓▒░  ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░")
        console.log(" ░▒▓███████▓▒░   ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░ ")
        console.log("")
    }

    setup() {
        this.commands = {
            "create": (args) => {
                if (args.length > 0) {
                    const roomId = args[0]
                    if (this.rooms.valid(roomId)) {
                        this.rooms.create(roomId, true)
                        console.log(`Raum #${roomId} erstellt.`)
                    } else {
                        console.error("FEHLER: Der Raumname muss aus genau 8 Zeichen der folgenden Zeichen bestehen: ABCDEFGHJKLMNPQRSTUVWXYZ0123456789")
                    }
                } else {
                    console.error("FEHLER: create <room>")
                }
            },
            "remove": (args) => {
                if (args.length > 0) {
                    const roomId = args[0]
                    if (this.rooms.get(roomId)) {
                        this.rooms.remove(roomId)
                        console.log(`Raum #${roomId} gelöscht.`)
                    } else {
                        console.error("FEHLER: Raum existiert nicht.")
                    }
                } else {
                    console.error("FEHLER: delete <room>")
                }
            },
            "list": () => {
                this.rooms.print()
            },
            "help": () => {
                console.log("\nVerfügbare Befehle:")
                console.log(" create <room>  - Erstellt einen neuen Raum.")
                console.log(" remove <room>  - Löscht den angegebenen Raum.")
                console.log(" list           - Zeigt eine Liste aller Räume.")
                console.log(" help           - Zeigt diese Hilfe an.")
                console.log(" quit           - Beendet das Programm.")
            },
            "quit": () => {
                process.exit(0)
            }
        }
    }

    start() {
        const cli = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true,
            prompt: "SYNC> ",
        })

        cli.prompt()

        cli.on("line", (line) => {
            const [command, ...args] = line.trim().split(" ")

            if (line === "") {
                cli.prompt()
                return
            }

            if (this.commands[command]) {
                this.commands[command](args)
            } else {
                console.error("FEHLER: Unbekannter Befehl. Nutze \"help\" für weitere Informationen.")
            }

            console.log("")
            cli.prompt()
        })

        cli.on("close", () => {
            process.exit(0)
        })
    }
}
