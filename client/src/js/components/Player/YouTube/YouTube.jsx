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

    const readyCalled = useRef(false)

    const onTimeUpdateRef = useRef(onTimeUpdate)

    const onReadyRef = useRef(onReady)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        onReadyRef.current = onReady
    }, [onReady])

    useEffect(() => {
        onTimeUpdateRef.current = onTimeUpdate
    }, [onTimeUpdate])

    useEffect(() => {
        const container = containerRef.current
        if (!container || !videoId) {
            return
        }

        let cancelled = false
        readyCalled.current = false

        const target = document.createElement("div")
        target.style.width = "100%"
        target.style.height = "100%"
        container.appendChild(target)

        loadYouTubeAPI().then(() => {
            if (cancelled || !container) {
                return
            }

            const player = new window.YT.Player(target, {
                videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    cc_load_policy: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    ...playerVars
                },
                events: {
                    onReady: () => {
                        if (cancelled) {
                            return
                        }

                        playerRef.current = player

                        setReady(true)

                        if (!readyCalled.current) {
                            readyCalled.current = true
                            onReadyRef.current?.()
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

            if (playerRef.current) {
                try {
                    playerRef.current.destroy()
                } catch (_) { }

                playerRef.current = null
            }

            if (container.contains(target)) {
                target.remove()
            }

            setReady(false)
        }
    }, [videoId])

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
        if (!playerRef.current || !ready) {
            return
        }

        try {
            playing ? playerRef.current.playVideo() : playerRef.current.pauseVideo()
        } catch (_) { }
    }, [playing, ready])

    useEffect(() => {
        if (!playerRef.current || !ready) {
            return
        }

        try { playerRef.current.setVolume(volume * 100) } catch (_) { }
    }, [volume, ready])

    useEffect(() => {
        if (!playerRef.current || !ready) {
            return
        }

        try {
            muted ? playerRef.current.mute() : playerRef.current.unMute()
        } catch (_) { }
    }, [muted, ready])

    useEffect(() => {
        if (!playerRef.current || !ready) {
            return
        }

        try { playerRef.current.setPlaybackRate(playbackRate) } catch (_) { }
    }, [playbackRate, ready])

    return (
        <div ref={containerRef} className={className} />
    )
}
