import { useState, useEffect } from "react"

export default function useHotkeys() {
    const [keys, setKeys] = useState({})

    useEffect(() => {
        const handleKeyDown = (event) => {
            setKeys(current => {
                if (current[event.key]) return current
                return {
                    ...current,
                    [event.key]: true
                }
            })
        }

        const handleKeyUp = (event) => {
            setKeys(current => {
                if (!current[event.key]) return current
                return {
                    ...current,
                    [event.key]: false
                }
            })
        }

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("keyup", handleKeyUp)
        
        // Disable scroll on spacebar
        document.addEventListener("keydown", (event) => {
            if(event.key === " " && event.target === document.body) {
                event.preventDefault()
            }
        })

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("keyup", handleKeyUp)
        }
    }, [])

    return [keys]
}
