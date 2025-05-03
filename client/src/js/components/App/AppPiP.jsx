import "./App.scss"

import { useState } from "react"

import useDevice from "../../hooks/UseDevice.jsx"
import useURL from "../../hooks/UseURL.jsx"
import useSync from "../../hooks/UseSync.jsx"

import Player from "../Player/Player.jsx"

export default function App() {
  const [deviceType] = useDevice()
  const [roomId, type] = useURL()
  const {
    player,
    video,
    handlePlayPause,
    handleSeek,
    handleSpeed,
    handleLoop,
    handleSponsorBlock,
  } = useSync(roomId)

  const [currentTime, setCurrentTime] = useState(0)

  return (
    <Player
      deviceType={deviceType}
      language={video.language}
      currentTime={currentTime}
      setCurrentTime={setCurrentTime}
      videoId={video.id}
      duration={video.duration}
      time={player.time}
      playing={player.playing}
      speed={player.speed}
      onSpeed={handleSpeed}
      onPlayPause={handlePlayPause}
      onSeek={handleSeek}
      loop={player.loop}
      onLoop={handleLoop}
      sponsorBlock={player.sponsorBlock.enabled}
      onSponsorBlock={handleSponsorBlock}
    />
  )
}