import "../../../../scss/elements/player/overlay/timeline.scss"

import { useEffect, useState } from "react"

import RangeSlider from "react-range-slider-input"

export default function Timeline({ duration, currentTime, onSeek }) {
    const [value, setValue] = useState([0, 0])
    const [seeking, setSeeking] = useState(false)

    const handleSeekStart = () => {
        setSeeking(true)
    }

    const handleSeekEnd = () => {
        onSeek(value[1])
        setSeeking(false)
    }

    useEffect(() => {
        if (!seeking) {
            setValue([0, currentTime])
        }
    }, [currentTime])

    return (
        <div className="player-overlay-timeline">
            <RangeSlider
                defaultValue={[0, 0]}
                thumbsDisabled={[true, false]}
                rangeSlideDisabled={true}
                min={0}
                max={duration}
                step={1}
                value={value}
                onInput={setValue}
                onRangeDragStart={handleSeekStart}
                onThumbDragStart={handleSeekStart}
                onRangeDragEnd={handleSeekEnd}
                onThumbDragEnd={handleSeekEnd}
            />
            <span>{timeFormat(value[1])}</span>
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