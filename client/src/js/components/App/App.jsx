import "./App.scss"

import { useState } from "react"

import UseDevice from "../../hooks/UseDevice.jsx"
import UseURL from "../../hooks/UseURL.jsx"
import UseSync from "../../hooks/UseSync.jsx"

import Search from "../Search/Search.jsx"
import Player from "../Player/Player.jsx"
import Information from "../Information/Information.jsx"
import Queue from "../Queue/Queue.jsx"
import Spacer from "../Spacer/Spacer.jsx"
import Viewer from "../Viewer/Viewer.jsx"

export default function App() {
  const [deviceType] = UseDevice()
  const [roomId, type] = UseURL()
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
  } = UseSync(roomId)

  const [currentTime, setCurrentTime] = useState(0)

  return (
    <>
      <header>
        <a href="/" className="logo">
          <img src="/icons/favicon-96x96.png" />
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