import "../../scss/elements/player.scss"

import { useRef, useState, useEffect } from "react"

import ReactPlayer from "react-player"

import Overlay from "./Player/Overlay"
import Ambilight from "./Player/Ambilight"

export default function Player({
    deviceType,
    currentTime, setCurrentTime,
    videoId, duration,
    time, onSeek,
    playing, onPlayPause,
    speed, onSpeed,
    loop, onLoop,
    sponsorBlock, onSponsorBlock
}) {
    const playerRef = useRef(null)
    const youtubeRef = useRef(null)

    const [ready, setReady] = useState(false)
    const [muteOverlay, setMuteOverlay] = useState(true)
    const [mute, setMute] = useState(true)
    const [volume, setVolume] = useState(JSON.parse(localStorage.getItem("volume") ?? "0.25"))
    const [ambilight, setAmbilight] = useState(JSON.parse(localStorage.getItem("ambilight") ?? "true"))

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
        if (!ready) {
            setReady(true)
            youtubeRef.current.seekTo(time)
            setTimeout(() => {
                // Sometimes player just plays even playing is false
                const player = youtubeRef.current.getInternalPlayer()
                playing ? player.playVideo() : player.pauseVideo()
            }, 500)
        }
        
        console.log(youtubeRef.current.getInternalPlayer())
    }

    useEffect(() => {
        if (Math.abs(time - currentTime) > 2) {
            setCurrentTime(time)
            youtubeRef.current.seekTo(time)
        }
    }, [time])

    return (
        <div className="player" ref={playerRef}>
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
                muteOverlay &&
                <div className="player-mute" onClick={handleMuteOverlay}>
                    <span className="icon-volume-xmark"></span>
                    <p>Zum Aufheben der Stummschaltung klicken</p>
                </div>
            }
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
                onFullscreen={handleFullscreen}
            />
            <ReactPlayer
                className="player-iframe"
                ref={youtubeRef}
                width="100%"
                height="100%"
                config={{
                    youtube: {
                        playerVars: {
                            autoplay: 1,
                            controls: 0,
                            disablekb: 1,
                            fs: 0,
                            iv_load_policy: 3,
                            cc_load_policy: 0,
                            modestbranding: 1,
                            playsinline: 1,
                            rel: 0,
                            showinfo: 0
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
                pip={true}
                playsinline
                onProgress={handleProgress}
                onReady={handleReady}
            />
        </div>
    )
}