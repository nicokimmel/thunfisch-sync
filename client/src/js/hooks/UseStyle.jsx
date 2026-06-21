import { useEffect } from "react"

export default function useStyle(css) {
    useEffect(() => {
        if (!css) {
            return
        }

        const styleElement = document.createElement("style")
        styleElement.textContent = css

        document.head.appendChild(styleElement)

        return () => {
            styleElement.remove()
        }
    }, [css])
}
