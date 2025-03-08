import { useState, useRef, useEffect } from "react"

export function usePiP(aspectRatio = 16 / 9, width = 640, height = 360) {
    const pipRef = useRef(null)
    const intervalRef = useRef(null)
    const [isPiPActive, setIsPiPActive] = useState(false)

    const openPiP = (title, url, onAction = () => { }) => {
        const windowHeight = height
        const windowWidth = width || Math.round(height * aspectRatio)
        const left = (window.screen.width - windowWidth) / 2
        const top = (window.screen.height - windowHeight) / 2

        const popup = window.open(
            url,
            title,
            `width=${windowWidth},height=${windowHeight},top=${top},left=${left},resizable=yes,toolbar=no,menubar=no,location=no,scrollbars=no,status=no`
        )

        if (popup) {
            pipRef.current = popup
            setIsPiPActive(true)
            onAction()
            popup.addEventListener("resize", () => {
                const newWidth = popup.innerWidth
                const newHeight = Math.round(newWidth / aspectRatio)
                popup.resizeTo(newWidth, newHeight)
            })
            startPiPClosedCheck()
        }
    }

    const closePiP = () => {
        if (pipRef.current) {
            pipRef.current.close()
            pipRef.current = null
            setIsPiPActive(false)
            stopPiPClosedCheck()
        }
    }

    const togglePiP = (title, url, onAction = () => { }) => {
        if (pipRef.current) {
            closePiP()
        } else {
            openPiP(title, url, onAction)
        }
    }

    const startPiPClosedCheck = () => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                if (pipRef.current && pipRef.current.closed) {
                    pipRef.current = null
                    setIsPiPActive(false)
                    stopPiPClosedCheck()
                }
            }, 1000)
        }
    }

    const stopPiPClosedCheck = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }

    useEffect(() => {
        return () => stopPiPClosedCheck()
    }, [])

    return { openPiP, closePiP, togglePiP, isPiPActive }
}
