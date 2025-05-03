import { useState } from "react"
import ReactDOM from "react-dom/client"

import PiP from "../components/PiP/PiP.jsx"

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
                handleReady()
            }
            pipWindow.addEventListener("beforeunload", handleClose)
            pipWindow.addEventListener("unload", handleClose)

            const headLinks = document.head.querySelectorAll("link[rel=\"stylesheet\"], style")
            headLinks.forEach(node => {
                pipWindow.document.head.appendChild(node.cloneNode(true))
            })

            const pipDiv = pipWindow.document.createElement("div")
            pipDiv.setAttribute("id", "pip")
            pipWindow.document.body.append(pipDiv)

            const pipRoot = ReactDOM.createRoot(
                pipWindow.document.getElementById("pip")
            )
            pipRoot.render(<PiP roomId={roomId} />)

            setIsPiPActive(true)
        })
    }

    return [handlePiP, isPiPActive]
}