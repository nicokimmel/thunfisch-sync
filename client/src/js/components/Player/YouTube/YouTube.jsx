import { useRef, useEffect, useState } from "react"

const IFRAME_API_URL = "https://www.youtube.com/iframe_api"

let apiLoadPromise = null

function loadYouTubeAPI() {
    if (apiLoadPromise) {
        return apiLoadPromise
    }

    apiLoadPromise = new Promise((resolve) => {
        if (window.YT?.Player) {
            resolve()
            return
        }

        const prev = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            if (prev) {
                prev()
            }

            resolve()
        }

        const tag = document.createElement("script")
        tag.src = IFRAME_API_URL
        document.head.appendChild(tag)
    })

    return apiLoadPromise
}

export default function YouTube({
    className,
    apiRef,
    videoId,
    playerVars = {},
    playing = false,
    volume = 1,
    muted = false,
    playbackRate = 1,
    onTimeUpdate,
    onReady
}) {
    const containerRef = useRef(null)
    const playerRef = useRef(null)
    const targetRef = useRef(null)

    const readyCalledRef = useRef(false)
    const onReadyRef = useRef(onReady)

    const onTimeUpdateRef = useRef(onTimeUpdate)

    const [ready, setReady] = useState(false)

    useEffect(() => {
        onReadyRef.current = onReady
    }, [onReady])

    useEffect(() => {
        onTimeUpdateRef.current = onTimeUpdate
    }, [onTimeUpdate])

    const setPlayerReady = (player) => {
        playerRef.current = player
        setReady(true)
        if (!readyCalledRef.current) {
            readyCalledRef.current = true
            onReadyRef.current?.()
        }
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container || !videoId) {
            return
        }

        let cancelled = false

        if (playerRef.current) {
            readyCalledRef.current = false

            try {
                playerRef.current.loadVideoById(videoId)
            } catch (_) { }

            return
        }

        if (!targetRef.current) {
            const target = document.createElement("div")
            target.style.width = "100%"
            target.style.height = "100%"
            container.appendChild(target)
            targetRef.current = target
        }

        loadYouTubeAPI().then(() => {
            if (cancelled) {
                return
            }

            const player = new window.YT.Player(targetRef.current, {
                videoId,
                playerVars: playerVars,
                events: {
                    onReady: () => {
                        if (!cancelled && !playerRef.current) {
                            setPlayerReady(player)
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === 1 && !readyCalledRef.current) {
                            setPlayerReady(player)
                        }
                    },
                    onError: (event) => {
                        console.error("YouTube Player Error:", event.data)
                    }
                }
            })
        })

        return () => {
            cancelled = true
        }
    }, [videoId])

    useEffect(() => {
        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy()
                } catch (_) { }

                playerRef.current = null
            }

            if (targetRef.current && containerRef.current?.contains(targetRef.current)) {
                targetRef.current.remove()
                targetRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (apiRef) {
            apiRef.current = {
                get currentTime() {
                    return playerRef.current?.getCurrentTime?.() ?? 0
                },
                set currentTime(value) {
                    playerRef.current?.seekTo?.(value, true)
                },
                play() {
                    playerRef.current?.playVideo?.()
                },
                pause() {
                    playerRef.current?.pauseVideo?.()
                }
            }
        }

        return () => {
            if (apiRef) {
                apiRef.current = null
            }
        }
    }, [apiRef])

    useEffect(() => {
        if (!ready) {
            return
        }

        const id = setInterval(() => {
            onTimeUpdateRef.current?.()
        }, 250)

        return () => clearInterval(id)
    }, [ready])

    useEffect(() => {
        const player = playerRef.current
        if (!player || !ready) {
            return
        }

        try {
            playing ? player.playVideo() : player.pauseVideo()
        } catch (_) { }

        try {
            player.setVolume(volume * 100)
        } catch (_) { }

        try {
            muted ? player.mute() : player.unMute()
        } catch (_) { }

        try {
            player.setPlaybackRate(playbackRate)
        } catch (_) { }
    }, [playing, volume, muted, playbackRate, ready])

    return (
        <div ref={containerRef} className={className} />
    )
}
