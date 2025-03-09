import "../../../../../scss/elements/player/overlay/control/volume.scss"

import { useEffect, useState } from "react"

import RangeSlider from "react-range-slider-input"

import Button from "./Button"

export default function Volume({
    mute, onMute,
    volume, onVolume
}) {
    const [icon, setIcon] = useState("icon-volume-x")

    const handleVolumeSliderInput = (value) => {
        onVolume(value[1] / 100)
    }

    const handleVolumeButtonClick = () => {
        onMute()
    }

    useEffect(() => {
        if (mute) {
            setIcon("icon-volume-x")
        } else {
            if (volume == 0) {
                setIcon("icon-volume-off")
            } else if (volume < .3) {
                setIcon("icon-volume-low")
            } else {
                setIcon("icon-volume-high")
            }
        }
    }, [mute, volume])

    return (
        <div className={"player-overlay-control-volume"}>
            <Button
                icon={icon}
                onClick={handleVolumeButtonClick}
            />
            <RangeSlider
                defaultValue={[0, localStorage.getItem("volume") * 100 || 25]}
                thumbsDisabled={[true, false]}
                rangeSlideDisabled={true}
                min={0}
                max={100}
                step={1}
                onInput={handleVolumeSliderInput}
            />
        </div>
    )
}