import "./Video.scss"

import { useEffect, useRef, useState } from "react"
import { useDrag, useDrop } from "react-dnd"
import { getEmptyImage } from "react-dnd-html5-backend"

import Spacer from "../../Spacer/Spacer.jsx"

export const ItemType = {
    VIDEO: "video"
}

export default function Video({
    index,
    title, channel, thumbnail, duration,
    onPlayClick, onAddClick, onTrashClick, onVideoMove
}) {
    const ref = useRef(null)
    const [dropDirection, setDropDirection] = useState(null)
    const dropDirectionRef = useRef(null)
    dropDirectionRef.current = dropDirection

    const [{ isOver }, drop] = useDrop({
        accept: ItemType.VIDEO,
        drop: () => {
            const dir = dropDirectionRef.current
            return { index: dir === "below" ? index + 1 : index }
        },
        hover(item, monitor) {
            if (!ref.current || !monitor.isOver()) return
            if (item.index === index) {
                setDropDirection(null)
                return
            }
            const rect = ref.current.getBoundingClientRect()
            const midY = (rect.bottom - rect.top) / 2
            const clientOffset = monitor.getClientOffset()
            if (!clientOffset) return
            const hoverClientY = clientOffset.y - rect.top
            setDropDirection(hoverClientY < midY ? "above" : "below")
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        })
    })

    useEffect(() => {
        if (!isOver) setDropDirection(null)
    }, [isOver])

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemType.VIDEO,
        item: () => ({
            index, title, channel, thumbnail, duration,
            width: ref.current?.getBoundingClientRect().width,
        }),
        end: (item, monitor) => {
            if (monitor.didDrop()) {
                const toIndex = monitor.getDropResult().index
                if (toIndex !== null && item.index !== toIndex) {
                    onVideoMove(item.index, toIndex)
                }
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        })
    })

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true })
    }, [preview])

    const dropClass = dropDirection ? `drop-${dropDirection}` : ""

    return (
        <div
            className={`video${isDragging ? " is-dragging" : ""}${dropClass ? ` ${dropClass}` : ""}`}
            ref={(node) => {
                ref.current = node
                drag(drop(node))
            }}
        >
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
                        <button className="video-info-thumbnail-button icon-trash" onClick={onTrashClick} />
                    }
                    {
                        onVideoMove && <>
                            <button className="video-info-thumbnail-button icon-double-arrow-up" onClick={() => { onVideoMove(index, 0) }} />
                            <button className="video-info-thumbnail-button icon-double-arrow-up reverse-icon" onClick={() => { onVideoMove(index, Number.MAX_VALUE) }} />
                        </>
                    }
                </div>
            </div>
        </div>
    )
}