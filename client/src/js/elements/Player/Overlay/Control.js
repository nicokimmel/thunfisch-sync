import "../../../../scss/elements/player/overlay/control.scss"

import { usePiP } from "../../../hooks/UsePiP"

import Spacer from "../../Spacer"
import Button from "./Control/Button"
import Volume from "./Control/Volume"

export default function Control({
    deviceType,
    currentTime, duration,
    playing, onPlayPause,
    mute, onMute,
    volume, onVolume,
    lock, onLock,
    onOptions,
    onFullscreen
}) {
    const { openPiP } = usePiP()

    const handlePiP = () => {
        openPiP("Thunfisch Sync - Picture in Picture", window.location.href + "/pip", onMute)
    }

    return (
        <div className={"player-overlay-control"}>
            <Button icon={playing ? "icon-pause" : "icon-play"} onClick={onPlayPause} />
            <Volume
                deviceType={deviceType}
                mute={mute}
                onMute={onMute}
                volume={volume}
                onVolume={onVolume}
            />
            <div className="player-overlay-control-timestamp">
                <span>{timeFormat(currentTime)}</span>
                <span>/</span>
                <span>{timeFormat(duration)}</span>
            </div>
            <Spacer type={"grow"} />
            <Button icon={"icon-picture-in-picture"} onClick={handlePiP} />
            {
                deviceType !== "desktop" &&
                <Button icon={lock ? "icon-lock" : "icon-lock-open"} onClick={onLock} />
            }
            <Button icon={"icon-settings"} onClick={onOptions} />
            <Button icon={"icon-fullscreen"} onClick={onFullscreen} />
        </div>
    )
}

function timeFormat(duration) {
    const hrs = ~~(duration / 3600)
    const mins = ~~((duration % 3600) / 60)
    const secs = ~~duration % 60

    let time = ""

    if (hrs > 0) {
        time += "" + hrs + ":" + (mins < 10 ? "0" : "")
    }

    time += "" + mins + ":" + (secs < 10 ? "0" : "")
    time += "" + secs

    return time
}