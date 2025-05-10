import { useState, useEffect } from "react"

export default function useHotkeys() {
    const [keys, setKeys] = useState({})

    const isTyping = (event) => {
        return event.target.matches("input, textarea, [contenteditable=\"true\"]")
    }
    
    useEffect(() => {
        const handleKeyDown = (event) => {
            if(isTyping(event) || event.repeat) { return }
            
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
