import "./PiP.scss"

import { useState } from "react"

import UseSync from "../../hooks/UseSync.jsx"

import Player from "../Player/Player.jsx"

export default function PiP({ roomId }) {
  const {
    player,
    video,
    handlePlayPause,
    handleSeek,
    handleSpeed,
    handleLoop,
    handleSponsorBlock,
  } = UseSync(roomId)

  const [currentTime, setCurrentTime] = useState(0)

  return (
    <Player
      deviceType={"pip"}
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