import { useState } from "react"

import useURL from "./hooks/UseURL"
import useSync from "./hooks/UseSync"

import Player from "./elements/Player"

export default function App() {
  const [roomId, type] = useURL()
  const {
    connected,
    player,
    video,
    handlePlayPause
  } = useSync(roomId)

  const [currentTime, setCurrentTime] = useState(0)

  return (
    <>
      <Player
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        videoId={video.id}
        duration={video.duration}
        time={player.time}
        playing={player.playing}
        onPlayPause={handlePlayPause}
        speed={player.speed}
      />
    </>
  )
}