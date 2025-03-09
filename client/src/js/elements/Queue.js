import "../../scss/elements/queue.scss"

import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import Video from "./Queue/Video"
import Spacer from "./Spacer"

export default function Queue({
    videos,
    onPlayClick, onTrashClick, onVideoDrag,
    onClearClick, onShuffleClick
}) {
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="queue">
                <div className="queue-controls">
                    <p>Warteschlange</p>
                    <Spacer />
                    <button className="icon-trash" onClick={onClearClick} />
                    <button className="icon-shuffle" onClick={onShuffleClick} />
                </div>
                <div className="queue-list">
                    {
                        videos.map((video, index) =>
                            <Video
                                index={index}
                                title={video.title}
                                channel={video.channel.name}
                                thumbnail={video.thumbnail}
                                duration={timeFormat(video.duration)}
                                onPlayClick={() => { onPlayClick([video], index) }}
                                onTrashClick={() => { onTrashClick(index) }}
                                onVideoDrag={onVideoDrag}
                            />
                        )
                    }
                </div>
            </div>
        </DndProvider>
    )
}

function timeFormat(duration) {
    const hrs = ~~(duration / 3600)
    const mins = ~~((duration % 3600) / 60)
    const secs = ~~duration % 60

    let time = ""

    if (hrs > 0) {
        time += "" + hrs + ":" + (mins < 10 ? "0" : "")
    }

    time += "" + mins + ":" + (secs < 10 ? "0" : "")
    time += "" + secs

    return time
}