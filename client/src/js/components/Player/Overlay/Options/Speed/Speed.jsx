import "./Speed.scss"

import { useEffect, useState } from "react"

import RangeSlider from "react-range-slider-input"

const SPEED_TABLE = [0.25, 0.5, 1, 1.25, 1.5, 2]

export default function Speed({ speed, onSpeed }) {
    const [value, setValue] = useState([0, 2])

    const handleInputEnd = () => {
        onSpeed(SPEED_TABLE[value[1]])
    }

    useEffect(() => {
        setValue([0, SPEED_TABLE.indexOf(speed)])
    }, [speed])

    return (
        <div className={"player-overlay-options-speed"}>
            <RangeSlider
                defaultValue={[0, 2]}
                thumbsDisabled={[true, false]}
                rangeSlideDisabled={true}
                min={0}
                max={5}
                step={1}
                value={value}
                onInput={setValue}
                onRangeDragEnd={handleInputEnd}
                onThumbDragEnd={handleInputEnd}
            />
            <span>{SPEED_TABLE[value[1]]}x</span>
        </div>
    )
}