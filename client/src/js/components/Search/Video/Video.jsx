import "./Video.scss"

import Spacer from "../../Spacer/Spacer.jsx"

export default function Video({
    title, channel, thumbnail, duration,
    onPlayClick, onAddClick
}) {
    return (
        <div className="video">
            <div className="video-thumbnail">
                <img className="video-thumbnail-image" src={thumbnail} />
                <span className="video-thumbnail-duration">{duration}</span>
            </div>
            <div className="video-info">
                <span className="video-info-title">{title}</span>
                <span className="video-info-channel">{channel}</span>
                <Spacer />
                <div className="video-info-buttons">
                    <button className="video-info-thumbnail-button icon-play" onClick={onPlayClick} />
                    <button className="video-info-thumbnail-button icon-plus" onClick={onAddClick} />
                </div>
            </div>
        </div>
    )
}