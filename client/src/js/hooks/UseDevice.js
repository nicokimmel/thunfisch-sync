import { useState, useEffect } from "react"

export default function useDevice() {
    const [deviceType, setDeviceType] = useState("desktop")

    useEffect(() => {
        if (window.innerWidth < 435) {
            setDeviceType("phone")
        } else if (window.innerWidth < 700) {
            setDeviceType("phablet")
        } else if (window.innerWidth < 1140) {
            setDeviceType("tablet")
        } else {
            setDeviceType("desktop")
        }
    }, [])

    return [deviceType]
}