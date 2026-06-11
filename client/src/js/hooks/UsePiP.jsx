import { useState } from "react"

export default function UsePiP(roomId) {
    const [isPiPActive, setIsPiPActive] = useState(false)

    const handlePiP = () => {
        if (window.documentPictureInPicture.window) {
            window.documentPictureInPicture.window.close()
        }

        window.documentPictureInPicture.requestWindow({
            preferInitialWindowPlacement: true,
            width: 520,
            height: 292
        }).then((pipWindow) => {
            const handleClose = () => {
                setIsPiPActive(false)
            }
            pipWindow.addEventListener("beforeunload", handleClose)
            pipWindow.addEventListener("unload", handleClose)

            pipWindow.document.body.style.margin = "0"
            pipWindow.document.body.style.overflow = "hidden"

            const pipFrame = pipWindow.document.createElement("iframe")
            pipFrame.src = `${window.location.pathname}#pip`
            pipFrame.title = "Thunfisch Sync PiP"
            pipFrame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture"
            pipFrame.style.display = "block"
            pipFrame.style.width = "100vw"
            pipFrame.style.height = "100vh"
            pipFrame.style.border = "0"
            pipWindow.document.body.append(pipFrame)

            setIsPiPActive(true)
        })
    }

    return [handlePiP, isPiPActive]
}
