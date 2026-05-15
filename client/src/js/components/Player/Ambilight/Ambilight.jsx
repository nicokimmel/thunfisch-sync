import "./Ambilight.scss"

import { useEffect, useRef } from "react"

import YouTube from "../YouTube/YouTube.jsx"

export default function Ambilight({ videoId, currentTime, playing, speed }) {
    const ambilightPlayerRef = useRef(null)

    useEffect(() => {
        ambilightPlayerRef.current.currentTime = currentTime
    }, [currentTime])

    return (
        <YouTube
            className="player-ambilight"
            apiRef={ambilightPlayerRef}
            videoId={videoId}
            playerVars={{
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                showinfo: 0
            }}
            playing={playing}
            volume={0}
            muted={true}
            playbackRate={speed}
        />
    )
}