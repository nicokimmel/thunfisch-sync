import "../../../../scss/elements/player/overlay/timeline.scss"

import { useEffect, useRef, useState } from "react"

import RangeSlider from "react-range-slider-input"

export default function Timeline({ duration, currentTime, onSeek }) {
    const sliderRef = useRef(null)

    const [value, setValue] = useState([0, 0])
    const [seeking, setSeeking] = useState(false)
    
    const [hoverValue, setHoverValue] = useState(0)
    const [tooltipHover, setTooltipHover] = useState(false)
    const [tooltipPosition, setTooltipPosition] = useState(0)

    const handleSeekStart = () => {
        setSeeking(true)
    }

    const handleSeekEnd = () => {
        onSeek(value[1])
        setSeeking(false)
    }

    useEffect(() => {
        const handleMouseMove = (event) => {
            const slider = event.currentTarget
            const rect = slider.getBoundingClientRect()
            const x = event.clientX - rect.left
            const time = (x / rect.width) * duration
            setHoverValue(time)
            setTooltipPosition(x)
        }

        const handleMouseEnter = () => {
            setTooltipHover(true)
        }

        const handleMouseLeave = () => {
            setTooltipHover(false)
        }

        const slider = sliderRef.current.querySelector(".range-slider")
        slider.addEventListener("mousemove", handleMouseMove)
        slider.addEventListener("mouseenter", handleMouseEnter)
        slider.addEventListener("mouseleave", handleMouseLeave)

        return () => {
            slider.removeEventListener("mousemove", handleMouseMove)
            slider.removeEventListener("mouseenter", handleMouseEnter)
            slider.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [duration])

    useEffect(() => {
        if (!seeking) {
            setValue([0, currentTime])
        }
    }, [currentTime])

    return (
        <div className="player-overlay-timeline" ref={sliderRef}>
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
            {
                tooltipHover && (
                    <span className="player-overlay-timeline-tooltip" style={{ left: `${tooltipPosition}px` }}>
                        {timeFormat(Math.round(hoverValue))}
                    </span>
                )
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