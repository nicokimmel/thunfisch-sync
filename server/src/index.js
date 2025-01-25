import "dotenv/config"

import manifest from "./res/manifest.json" with { type: "json" }

import express from "express"
import path from "path"
import http from "http"
import bodyParser from "body-parser"

import { Room, RoomList } from "./rooms.js"
import Connection from "./connection.js"
import Sync from "./sync.js"

const PORT = process.env.PORT || 3000

const __dirname = import.meta.dirname

const app = express()
const server = http.createServer(app)

const roomList = new RoomList()
const connection = new Connection(server, roomList)
const sync = new Sync(connection, roomList)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.resolve(__dirname, "..", "..", "client", "build"), { index: false }))

app.set("view engine", "ejs")

app.get("/robots.txt", (req, res) => {
  res.type("text/plain")
  res.send("User-agent: *\nDisallow: /")
})

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "client", "build", "images", "favicon.ico"))
})

app.get("/", (req, res) => {
  const roomId = roomList.create().id
  res.redirect(`/${roomId}`)
})

app.get("/:roomId", (req, res) => {
  const roomId = req.params.roomId

  // Always use uppercase room ids
  if (roomId !== roomId.toUpperCase()) {
    res.redirect(`/${roomId.toUpperCase()}`)
    return
  }

  if (!roomList.valid(roomId)) {
    const roomId = roomList.create().id
    res.redirect(`/${roomId}`)
    return
  }

  if (!roomList.exists(roomId)) {
    roomList.create(roomId)
  }

  res.render(path.resolve(__dirname, "..", "..", "client", "build", "index.ejs"), {roomId: roomId})
})

app.get("/:roomId/manifest.json", (req, res) => {
  const roomId = req.params.roomId
  manifest.start_url = `/${roomId}`
  res.json(manifest)
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)

  roomList.create("STANDARD", true)
  sync.loop()
})