import "./Player.scss"

import { useRef, useState, useEffect } from "react"

import { CSSTransition } from "react-transition-group"
import ReactPlayer from "react-player"

import UseHotkey from "../../hooks/UseHotkey.jsx"

import Overlay from "./Overlay/Overlay.jsx"
import Ambilight from "./Ambilight/Ambilight.jsx"
import Indicators from "./Indicator/Indicators.jsx"

export default function Player({
    deviceType,
    language,
    currentTime, setCurrentTime,
    videoId, duration,
    time, onSeek,
    playing, onPlayPause,
    speed, onSpeed,
    loop, onLoop,
    sponsorBlock, onSponsorBlock,
    onPiP
}) {
    const [keys] = UseHotkey()

    const playerRef = useRef(null)
    const youtubeRef = useRef(null)
    const timeRef = useRef(currentTime)
    const hoverTimeoutRef = useRef(null)

    const [playerKey, setPlayerKey] = useState(Date.now())
    const [ready, setReady] = useState(false)
    const [muteOverlay, setMuteOverlay] = useState(true)
    const [mute, setMute] = useState(true)
    const [volume, setVolume] = useState(JSON.parse(localStorage.getItem("volume") ?? "0.25"))
    const [ambilight, setAmbilight] = useState(JSON.parse(localStorage.getItem("ambilight") ?? "true"))
    const [hover, setHover] = useState(true)

    const handleMuteOverlay = () => {
        setMuteOverlay(false)
        setMute(false)
    }

    const handleMute = () => {
        setMute(!mute)
    }

    const handleVolume = (value) => {
        setVolume(value)
        localStorage.setItem("volume", value)
        if (mute) {
            setMute(false)
        }
    }

    const handleAmbilight = () => {
        localStorage.setItem("ambilight", !ambilight)
        setAmbilight(!ambilight)
    }

    const handleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            playerRef.current.requestFullscreen()
        }
    }

    const handleProgress = (event) => {
        setCurrentTime(Math.floor(event.playedSeconds))
    }

    const handleReady = () => {
        const player = youtubeRef.current.getInternalPlayer()

        if (!ready) {
            setReady(true)
            player.seekTo(time)
            setTimeout(() => {
                // Sometimes player just plays even playing is false
                playing ? player.playVideo() : player.pauseVideo()
            }, 500)
        }
    }
    
    const handleMouseEnter = () => {
        setHover(true)
    }

    const handleMouseLeave = () => {
        setHover(false)
        clearTimeout(hoverTimeoutRef.current)
    }

    const handleMouseMove = () => {
        setHover(true)
        playerRef.current.style.cursor = ""
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = setTimeout(() => {
            setHover(false)
            playerRef.current.style.cursor = "none"
        }, 2000)
    }

    useEffect(() => {
        timeRef.current = currentTime;
    }, [currentTime])

    useEffect(() => {
        if (keys.ArrowLeft) {
            onSeek(timeRef.current - 5)
        }
        if (keys.ArrowRight) {
            onSeek(timeRef.current + 5)
        }
        if (keys[" "] || keys.Spacebar) {
            onPlayPause()
        }
    }, [keys])

    useEffect(() => {
        if (Math.abs(time - currentTime) > 2) {
            setCurrentTime(time)
            youtubeRef.current.seekTo(time)
        }
    }, [time])

    useEffect(() => {
        if (deviceType === "desktop" || deviceType === "pip") {
            setVolume(JSON.parse(localStorage.getItem("volume") ?? "0.25"))
        } else {
            setVolume(1)
        }
    }, [deviceType])

    useEffect(() => {
        const handleFullscreen = () => {
            if (document.fullscreenElement) {
                setAmbilight(false)
            } else {
                setAmbilight(JSON.parse(localStorage.getItem("ambilight") ?? "true"))
            }
        }

        document.addEventListener("fullscreenchange", handleFullscreen)

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreen)
        }
    }, [])

    useEffect(() => {
        // Workaround for remounting player
        // in order to reload youtube parameters
        // to force language.
        setPlayerKey(Date.now())
    }, [language])

    return (
        <div className={"player"}
            ref={playerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {
                ambilight && deviceType === "desktop" &&
                <Ambilight
                    url={`https://www.youtube.com/watch?v=${videoId}`}
                    currentTime={currentTime}
                    playing={playing}
                    speed={speed}
                />
            }
            {
                (ready && muteOverlay) &&
                <div className="player-mute" onClick={handleMuteOverlay}>
                    <span className="icon-volume-x"></span>
                    <p>Zum Aufheben der Stummschaltung klicken</p>
                </div>
            }
            <Indicators playing={playing} keys={keys} />
            <CSSTransition
                in={hover}
                timeout={250}
                classNames="fade"
                mountOnEnter
                unmountOnExit
            >
                <Overlay
                    deviceType={deviceType}
                    playing={playing}
                    onPlayPause={onPlayPause}
                    mute={mute}
                    onMute={handleMute}
                    volume={volume}
                    onVolume={handleVolume}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={onSeek}
                    loop={loop}
                    onLoop={onLoop}
                    sponsorBlock={sponsorBlock}
                    onSponsorBlock={onSponsorBlock}
                    ambilight={ambilight}
                    onAmbilight={handleAmbilight}
                    speed={speed}
                    onSpeed={onSpeed}
                    onPiP={onPiP}
                    onFullscreen={handleFullscreen}
                />
            </CSSTransition>
            <ReactPlayer
                key={playerKey}
                className="player-iframe"
                ref={youtubeRef}
                width="100%"
                height="100%"
                config={{
                    youtube: {
                        playerVars: {
                            origin: "*",
                            autoplay: 1,
                            controls: 0,
                            disablekb: 1,
                            fs: 0,
                            iv_load_policy: 3,
                            cc_load_policy: 0,
                            modestbranding: 1,
                            playsinline: 1,
                            rel: 0,
                            showinfo: 0,
                            hl: language,
                            persist_hl: 1
                        }
                    }
                }}
                url={`https://www.youtube.com/watch?v=${videoId}`}
                playing={playing}
                controls={false}
                volume={volume}
                muted={mute}
                playbackRate={speed}
                playsinline
                onProgress={handleProgress}
                onReady={handleReady}
            />
        </div>
    )
}