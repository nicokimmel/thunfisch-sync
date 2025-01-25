import "../../../scss/elements/player/ambilight.scss"

import { useEffect, useRef } from "react"

import ReactPlayer from "react-player"

export default function Ambilight({ url, currentTime, playing, speed }) {
    const ambilightPlayerRef = useRef(null)

    useEffect(() => {
        ambilightPlayerRef.current.seekTo(currentTime)
    }, [currentTime])

    return (
        <ReactPlayer
            className="player-ambilight"
            ref={ambilightPlayerRef}
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
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                        showinfo: 0
                    }
                }
            }}
            url={url}
            playing={playing}
            controls={false}
            volume={0}
            muted={true}
            playbackRate={speed}
            pip={false}
            playsinline
        />
    )
}