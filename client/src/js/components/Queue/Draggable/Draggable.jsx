import "./Draggable.scss"

import { useDragLayer } from "react-dnd"

import { ItemType } from "../Video/Video.jsx"

export default function Draggable() {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging() && monitor.getItemType() === ItemType.VIDEO,
    }))

    if (!isDragging || !currentOffset) return null

    return (
        <div className="draggable">
            <div
                className="draggable-preview"
                style={{
                    width: item.width,
                    transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
                }}
            >
                <div className="draggable-thumbnail">
                    <img src={item.thumbnail} />
                    <span>{item.duration}</span>
                </div>
                <div className="draggable-info">
                    <span className="draggable-title">{item.title}</span>
                    <span className="draggable-channel">{item.channel}</span>
                </div>
            </div>
        </div>
    )
}
