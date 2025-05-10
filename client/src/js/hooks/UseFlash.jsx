import { useState, useEffect, useRef } from "react"

export default function UseFlash(value, duration = 300) {
    const timer = useRef()
    const mounted = useRef(false)
    
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if(!mounted.current) {
            mounted.current = true
            return
        }
        
        setVisible(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => {
            setVisible(false)
        }, duration)

        return () => clearTimeout(timer.current)
    }, [value])

    return visible
}
