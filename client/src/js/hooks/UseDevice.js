import { useState, useEffect } from "react"

export default function useDevice() {
    const [deviceType, setDeviceType] = useState("desktop")

    useEffect(() => {
        if (window.screen.width < 435) {
            setDeviceType("phone")
        } else if (window.screen.width < 700) {
            setDeviceType("phablet")
        } else if (window.screen.width < 1140) {
            setDeviceType("tablet")
        } else {
            setDeviceType("desktop")
        }
    }, [])

    return [deviceType]
}