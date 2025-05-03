import "./Overlay.scss"

import { useState } from "react"

import { CSSTransition } from "react-transition-group"

import Timeline from "./Timeline/Timeline.jsx"
import Control from "./Control/Control.jsx"
import Options from "./Options/Options.jsx"

export default function Overlay({
    deviceType,
    playing, onPlayPause,
    mute, onMute,
    volume, onVolume,
    loop, onLoop,
    sponsorBlock, onSponsorBlock,
    ambilight, onAmbilight,
    speed, onSpeed,
    onPiP,
    onFullscreen,
    duration, currentTime, onSeek
}) {
    const [options, setOptions] = useState(false)
    const [lock, setLock] = useState(false)

    const [indicator, setIndicator] = useState(false)
    const [indicatorTimeout, setIndicatorTimeout] = useState(null)

    const handleClick = (event) => {
        if (event.currentTarget !== event.target) {
            return
        }

        if (deviceType !== "desktop" && deviceType !== "pip") {
            return
        }

        onPlayPause()
        setIndicator(true)
        clearTimeout(indicatorTimeout)
        setIndicatorTimeout(setTimeout(() => {
            setIndicatorTimeout(null)
            setIndicator(false)
        }, 300))
    }

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
        <div
            className="player-overlay"
            onClick={handleClick}
        >
            <CSSTransition
                in={indicator}
                timeout={100}
                classNames="scale"
                mountOnEnter
                unmountOnExit
            >
                <span className={`indicator ${playing ? "icon-play" : "icon-pause"}`} />
            </CSSTransition>
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
                onPiP={onPiP}
                onOptions={handleLockWrapper(handleOptions)}
                onFullscreen={handleLockWrapper(onFullscreen)}
            />
        </div>
    )
}