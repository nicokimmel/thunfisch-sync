import "../scss/elements/header.scss"
import "../scss/elements/main.scss"
import "../scss/elements/footer.scss"

import { useState } from "react"

import useDevice from "./hooks/UseDevice"
import useURL from "./hooks/UseURL"
import useSync from "./hooks/UseSync"

import Search from "./elements/Search"
import Player from "./elements/Player"
import Information from "./elements/Information"
import Queue from "./elements/Queue"
import Spacer from "./elements/Spacer"
import Viewer from "./elements/Viewer"

export default function App() {
  const [deviceType] = useDevice()
  const [roomId, type] = useURL()
  const {
    connected,
    viewer,
    player,
    video,
    queue,
    search,
    handlePlayPause,
    handleSeek,
    handleSpeed,
    handleLoop,
    handleSponsorBlock,
    handleSearch,
    handleVideo,
    handleQueueAdd,
    handleQueueMove,
    handleQueueRemove,
    handleQueueClear,
    handleQueueShuffle
  } = useSync(roomId)

  const [currentTime, setCurrentTime] = useState(0)

  return (
    <>
      <header>
        <a href="/" className="logo">
          <img src="/icons/android-icon-48x48.png" />
          SYNC
          {
            connected === false &&
            <span className="icon-power-off" />
          }
        </a>
        <Spacer />
        <Search
          results={search.results}
          type={search.type}
          onSearch={handleSearch}
          onPlayClick={handleVideo}
          onAddClick={handleQueueAdd}
        />
        <Viewer count={viewer} />
      </header>
      <main>
        <div>
          <Player
            deviceType={deviceType}
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
          <Information
            currentTime={currentTime}
            videoId={video.id}
            videoTitle={video.title}
            videoViews={video.views}
            channelImage={video.channel.image}
            channelName={video.channel.name}
            channelSubscribers={video.channel.subscribers}
            channelId={video.channel.id}
          />
        </div>
        <div>
          <Queue
            videos={queue}
            onPlayClick={handleVideo}
            onTrashClick={handleQueueRemove}
            onVideoDrag={handleQueueMove}
            onClearClick={handleQueueClear}
            onShuffleClick={handleQueueShuffle}
          />
        </div>
      </main>
    </>
  )
}