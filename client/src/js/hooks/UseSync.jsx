import { useEffect, useState } from "react"

import { io } from "socket.io-client"

const socket = io(undefined, {
    "reconnection": true,
    "reconnectionDelay": 500,
    "reconnectionAttempts": 10
})

export default function UseSync(roomId) {
    const [connected, setConnected] = useState(null)
    const [viewer, setViewer] = useState(1)
    const [player, setPlayer] = useState({
        playing: false,
        time: 0,
        speed: 1,
        loop: false,
        sponsorBlock: {
            enabled: true,
            segments: []
        }
    })
    const [video, setVideo] = useState({
        id: "",
        title: "",
        channel: {
            id: "",
            name: "",
            subscribers: 0,
            image: ""
        },
        duration: 0,
        tags: [],
        views: 0,
        language: "en",
    })
    const [queue, setQueue] = useState([])
    const [search, setSearch] = useState({
        type: "s",
        results: []
    })

    const handlePlayPause = () => {
        socket.emit(player.playing ? "pause" : "play")
    }

    const handleSeek = (time) => {
        socket.emit("seek", time)
    }

    const handleSpeed = (speed) => {
        socket.emit("speed", speed)
    }

    const handleLoop = () => {
        socket.emit("loop")
    }

    const handleSponsorBlock = () => {
        socket.emit("sponsorblock")
    }

    const handleSearch = (searchTerm) => {
        socket.emit("search", searchTerm)
    }

    const handleVideo = (videoList, queuePos) => {
        socket.emit("video", videoList, queuePos)
    }

    const handleQueueAdd = (videoList) => {
        socket.emit("queue-add", videoList)
    }

    const handleQueueMove = (from, to) => {
        socket.emit("queue-move", from, to)
    }

    const handleQueueRemove = (index) => {
        socket.emit("queue-remove", index)
    }

    const handleQueueClear = () => {
        socket.emit("queue-clear")
    }

    const handleQueueShuffle = () => {
        socket.emit("queue-shuffle")
    }

    useEffect(() => {
        if (!roomId) {
            return
        }
        
        socket.emit("join", roomId)
        
        socket.on("connect", () => {
            if(!connected) {
                console.log("(RE)CONNECTED! SENDING HANDSHAKE")
                socket.emit("join", roomId)
            }
        })

        socket.on("disconnect", () => {
            console.log("DISCONNECT")
            setConnected(false)
        })

        socket.on("join", (room) => {
            console.log(room)
            setViewer(room.viewer)
            setPlayer(room.player)
            setVideo(room.video)
            setQueue(room.queue)
            setConnected(true)
        })

        socket.on("kick", () => {
            window.location.href = "/"
        })

        socket.on("viewer", (count) => {
            setViewer(count)
        })

        socket.on("play", (time) => {
            setPlayer(playerObject => ({
                ...playerObject,
                playing: true,
                time: time
            }))
        })

        socket.on("pause", (time) => {
            setPlayer(playerObject => ({
                ...playerObject,
                playing: false,
                time: time
            }))
        })

        socket.on("seek", (time) => {
            setPlayer(playerObject => ({
                ...playerObject,
                time: time
            }))
        })

        socket.on("loop", (loop) => {
            setPlayer(playerObject => ({
                ...playerObject,
                loop: loop
            }))
        })

        socket.on("sponsorblock", (sponsorBlock) => {
            setPlayer(playerObject => ({
                ...playerObject,
                sponsorBlock: {
                    ...playerObject.sponsorBlock,
                    enabled: sponsorBlock
                }
            }))
        })

        socket.on("speed", (speed) => {
            setPlayer(playerObject => ({
                ...playerObject,
                speed: speed
            }))
        })

        socket.on("search", (videoList, searchType) => {
            setSearch({
                type: searchType,
                results: videoList
            })
        })

        socket.on("queue", (videoList) => {
            setQueue(videoList)
        })

        socket.on("video", (player, video) => {
            console.log(player)
            console.log(video)
            setPlayer(player)
            setVideo(video)
        })

        socket.on("tick", (playing, time) => {
            setPlayer(playerObject => ({
                ...playerObject,
                playing: playing,
                time: time
            }))
        })

        return () => {
            socket.off("connect")
            socket.off("disconnect")
            socket.off("join")
            socket.off("kick")
            socket.off("viewer")
            socket.off("play")
            socket.off("pause")
            socket.off("seek")
            socket.off("loop")
            socket.off("sponsorblock")
            socket.off("speed")
            socket.off("search")
            socket.off("queue")
            socket.off("video")
        }
    }, [roomId])

    return {
        connected,
        viewer,
        player,
        video,
        queue,
        search,
        handlePlayPause,
        handleSeek,
        handleSpeed,
        handleLoop,
        handleSponsorBlock,
        handleSearch,
        handleVideo,
        handleQueueAdd,
        handleQueueMove,
        handleQueueRemove,
        handleQueueClear,
        handleQueueShuffle
    }
}