import "./Options.scss"

import Speed from "./Speed/Speed.jsx"
import Toggle from "./Toggle/Toggle.jsx"

export default function Options({
    deviceType,
    loop, onLoop,
    sponsorBlock, onSponsorBlock,
    ambilight, onAmbilight,
    speed, onSpeed
}) {
    return (
        <div className={"player-overlay-options"}>
            <span>Wiederholung</span>
            <Toggle checked={loop} onCheck={onLoop} />
            <span>Werbung überspringen</span>
            <Toggle checked={sponsorBlock} onCheck={onSponsorBlock} />
            {
                deviceType === "desktop" &&
                <>
                    <span>Lichteffekte</span>
                    <Toggle checked={ambilight} onCheck={onAmbilight} />
                </>
            }
            <span>Geschwindigkeit</span>
            <Speed speed={speed} onSpeed={onSpeed} />
        </div>
    )
}