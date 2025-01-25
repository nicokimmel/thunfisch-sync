import "../../../../scss/elements/player/overlay/control.scss"

import Spacer from "../../Spacer"
import Button from "./Control/Button"
import Volume from "./Control/Volume"

export default function Control({
    playing, onPlayPause,
    mute, onMute,
    volume, onVolume,
    onOptions,
    onFullscreen
}) {
    return (
        <div className={"player-overlay-control"}>
            <Button icon={playing ? "icon-pause" : "icon-play"} onClick={onPlayPause} />
            <Volume
                mute={mute}
                onMute={onMute}
                volume={volume}
                onVolume={onVolume}
            />
            <Spacer type={"grow"} />
            <Button icon={"icon-gear"} onClick={onOptions} />
            <Button icon={"icon-expand"} onClick={onFullscreen} />
        </div>
    )
}