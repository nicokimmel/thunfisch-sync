import "../../scss/elements/information.scss"

import { useState } from "react"

import Spacer from "./Spacer"

export default function Information({
    currentTime, videoId,
    videoTitle, videoViews,
    channelImage, channelName, channelSubscribers, channelId
}) {
    const [shareText, setShareText] = useState("Teilen")

    const handleShareClick = () => {
        navigator.clipboard.writeText(`https://youtu.be/${videoId}?t=${currentTime}`)
        setShareText("Kopiert!")
        setTimeout(() => {
            setShareText("Teilen")
        }, 2000)
    }

    return (
        <div className={"information"}>
            <div className={"information-top"}>
                <span className="information-top-title">{videoTitle}</span>
                <span className="information-top-views">{parseInt(videoViews).toLocaleString()} Aufrufe</span>
            </div>
            <Spacer />
            <div className={"information-bottom"}>
                <a className={"information-bottom-channel"} href={`https://www.youtube.com/channel/${channelId}`} target={"_blank"}>
                    <img src={channelImage} />
                    <div>
                        <span className={"information-bottom-channel-name"}>{channelName}</span>
                        <span className={"information-bottom-channel-subscribers"}>{parseInt(channelSubscribers).toLocaleString()} Abonnenten</span>
                    </div>
                </a>
                <div className={"information-bottom-buttons"}>
                    <a className={"icon-youtube-brands"} href={`https://www.youtube.com/watch?v=${videoId}`} target={"_blank"}>YouTube</a>
                    <a className={"icon-arrow-up-right-from-square"} onClick={handleShareClick}>{shareText}</a>
                </div>
            </div>
        </div>
    )
}