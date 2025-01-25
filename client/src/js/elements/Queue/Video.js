import "../../../scss/elements/video.scss"

import { useDrag, useDrop } from "react-dnd"

import Spacer from "../Spacer"

const ItemType = {
    VIDEO: "video"
}

export default function Video({
    index,
    title, channel, thumbnail, duration,
    onPlayClick, onAddClick, onTrashClick, onVideoDrag
}) {
    const [, drop] = useDrop({
        accept: ItemType.VIDEO,
        drop: () => ({ index })
    })

    const [, drag] = useDrag({
        type: ItemType.VIDEO,
        item: { index },
        end: (item, monitor) => {
            if (monitor.didDrop()) {
                const toIndex = monitor.getDropResult().index
                if (toIndex !== null && item.index !== toIndex) {
                    onVideoDrag(item.index, toIndex)
                }
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    })

    return (
        <div className="video" ref={(node) => drag(drop(node))}>
            <div className="video-thumbnail">
                <img className="video-thumbnail-image" src={thumbnail} />
                <span className="video-thumbnail-duration">{duration}</span>
            </div>
            <div className="video-info">
                <span className="video-info-title">{title}</span>
                <span className="video-info-channel">{channel}</span>
                <Spacer />
                <div className="video-info-buttons">
                    {
                        onPlayClick &&
                        <button className="video-info-thumbnail-button icon-play" onClick={onPlayClick} />
                    }
                    {
                        onAddClick &&
                        <button className="video-info-thumbnail-button icon-plus" onClick={onAddClick} />
                    }
                    {
                        onTrashClick &&
                        <button className="video-info-thumbnail-button icon-trash-can" onClick={onTrashClick} />
                    }
                </div>
            </div>
        </div>
    )
}