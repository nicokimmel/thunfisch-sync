import "./Control.scss"

import Spacer from "../../../Spacer/Spacer.jsx"
import Button from "./Button/Button.jsx"
import Volume from "./Volume/Volume.jsx"

export default function Control({
    deviceType,
    currentTime, duration,
    playing, onPlayPause,
    mute, onMute,
    volume, onVolume,
    lock, onLock,
    onPiP,
    onOptions,
    onFullscreen
}) {
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
            {
                deviceType === "desktop" && "documentPictureInPicture" in window &&
                <Button icon={"icon-picture-in-picture"} onClick={onPiP} />
            }
            {
                deviceType !== "desktop" && deviceType !== "pip" &&
                <Button icon={lock ? "icon-lock" : "icon-lock-open"} onClick={onLock} />
            }
            {
                deviceType !== "pip" &&
                <>
                    <Button icon={"icon-settings"} onClick={onOptions} />
                    <Button icon={"icon-fullscreen"} onClick={onFullscreen} />
                </>
            }
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