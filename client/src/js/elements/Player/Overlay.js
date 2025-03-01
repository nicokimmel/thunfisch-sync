import "../../../scss/elements/player/overlay.scss"

import { useState } from "react"

import Timeline from "./Overlay/Timeline"
import Control from "./Overlay/Control"
import Options from "./Overlay/Options"

export default function Overlay({
    deviceType,
    playing, onPlayPause,
    mute, onMute,
    volume, onVolume,
    loop, onLoop,
    sponsorBlock, onSponsorBlock,
    ambilight, onAmbilight,
    speed, onSpeed,
    onFullscreen,
    duration, currentTime, onSeek
}) {
    const [options, setOptions] = useState(false)
    const [lock, setLock] = useState(false)

    const handleLock = () => {
        setLock(!lock)
    }

    const handleOptions = () => {
        setOptions(!options)
    }

    const handleLockWrapper = (func) => (...args) => {
        if (!lock) {
            func(...args)
        }
    }

    return (
        <div className="player-overlay">
            {
                options &&
                <Options
                    deviceType={deviceType}
                    loop={loop}
                    onLoop={onLoop}
                    sponsorBlock={sponsorBlock}
                    onSponsorBlock={onSponsorBlock}
                    ambilight={ambilight}
                    onAmbilight={onAmbilight}
                    speed={speed}
                    onSpeed={onSpeed}
                />
            }
            <Timeline
                duration={duration}
                currentTime={currentTime}
                onSeek={handleLockWrapper(onSeek)}
            />
            <Control
                deviceType={deviceType}
                currentTime={currentTime}
                duration={duration}
                playing={playing}
                onPlayPause={handleLockWrapper(onPlayPause)}
                mute={mute}
                onMute={handleLockWrapper(onMute)}
                volume={volume}
                onVolume={handleLockWrapper(onVolume)}
                lock={lock}
                onLock={handleLock}
                onOptions={handleLockWrapper(handleOptions)}
                onFullscreen={handleLockWrapper(onFullscreen)}
            />
        </div>
    )
}