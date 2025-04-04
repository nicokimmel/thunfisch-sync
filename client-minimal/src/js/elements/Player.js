import "../../scss/elements/player.scss"

import { useRef, useState, useEffect } from "react"

import { CSSTransition } from "react-transition-group"
import ReactPlayer from "react-player"

import Overlay from "./Player/Overlay"

export default function Player({
    language,
    currentTime, setCurrentTime,
    videoId, duration,
    time,
    playing, onPlayPause,
    speed
}) {
    const playerRef = useRef(null)
    const youtubeRef = useRef(null)
    
    const hoverTimeoutRef = useRef(null)
    
    const [playerKey, setPlayerKey] = useState(Date.now())

    const [ready, setReady] = useState(false)
    const [muteOverlay, setMuteOverlay] = useState(true)
    const [mute, setMute] = useState(true)
    const [volume, setVolume] = useState(JSON.parse(localStorage.getItem("volume") ?? "0.25"))
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

    const handleProgress = (event) => {
        setCurrentTime(Math.floor(event.playedSeconds))
    }

    const handleReady = () => {
        if (!ready) {
            setReady(true)
            youtubeRef.current.seekTo(time)
            setTimeout(() => {
                // Sometimes player just plays even playing is false
                const player = youtubeRef.current.getInternalPlayer()
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
        document.body.style.cursor = ""
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = setTimeout(() => {
            setHover(false)
            document.body.style.cursor = "none"
        }, 2000)
    }

    useEffect(() => {
        if (Math.abs(time - currentTime) > 2) {
            setCurrentTime(time)
            youtubeRef.current.seekTo(time)
        }
    }, [time])

    useEffect(() => {
        // Workaround for remounting player
        // in order to reload youtube parameters
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
                (ready && muteOverlay) &&
                <div className="player-mute" onClick={handleMuteOverlay}>
                    <span className="icon-volume-x"></span>
                    <p>Zum Aufheben der Stummschaltung klicken</p>
                </div>
            }
            <CSSTransition
                in={hover}
                timeout={250}
                classNames="fade"
                mountOnEnter
                unmountOnExit
            >
                <Overlay
                    playing={playing}
                    onPlayPause={onPlayPause}
                    mute={mute}
                    onMute={handleMute}
                    volume={volume}
                    onVolume={handleVolume}
                    currentTime={currentTime}
                    duration={duration}
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
                        },
                        embedOptions: {
                            host: "https://www.youtube-nocookie.com"
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