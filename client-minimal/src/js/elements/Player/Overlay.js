import "../../../scss/elements/player/overlay.scss"

import Control from "./Overlay/Control"

export default function Overlay({
    playing, onPlayPause,
    mute, onMute,
    volume, onVolume,
    duration, currentTime
}) {
    return (
        <div className="player-overlay">
            <Control
                currentTime={currentTime}
                duration={duration}
                playing={playing}
                onPlayPause={onPlayPause}
                mute={mute}
                onMute={onMute}
                volume={volume}
                onVolume={onVolume}
            />
        </div>
    )
}