import request from "request"
import moment from "moment"

export default class YouTube {

    static API_BASE_URL = "https://youtube.googleapis.com/youtube/v3"
    static MAX_SEARCH_RESULTS = 20
    static MAX_PLAYLIST_RESULTS = 300

    constructor() {
        this.key = process.env.YOUTUBE_API_KEY
        this.filter = process.env.CHANNEL_FILTER
    }

    getVideoInfo(idList, callback) {
        request(YouTube.API_BASE_URL + "/videos?part=snippet%2CcontentDetails%2Cstatistics&maxResults=200&id=" + idList.join(",") + "&key=" + this.key, { json: true }, (err, res, body) => {
            if (err || !body) {
                callback([])
                return
            }

            let videoList = []
            let channelIdList = []

            for (let i in body.items) {
                let video = body.items[i]

                let duration = moment.duration(video.contentDetails.duration).asSeconds()
                duration = duration === 0 ? -1 : duration
                videoList.push({
                    id: video.id,
                    title: video.snippet.title,
                    channel: {
                        id: video.snippet.channelId,
                        name: video.snippet.channelTitle
                    },
                    thumbnail: video.snippet.thumbnails.medium.url,
                    duration: duration,
                    tags: video.snippet.tags,
                    views: video.statistics.viewCount,
                    language: video.snippet.defaultAudioLanguage
                })
                channelIdList.push(video.snippet.channelId)
            }

            this.getChannelInfo(channelIdList, (channelList) => {
                videoList.forEach(video => {
                    const channel = channelList.find(channel => channel.id === video.channel.id)
                    if (channel) {
                        video.channel = channel
                    } else {
                        video.channel.thumbnail = "https://placehold.co/88x88"
                    }
                })

                callback(videoList)
            })
        })
    }

    getChannelInfo(idList, callback) {
        request(YouTube.API_BASE_URL + "/channels?part=snippet%2Cstatistics&maxResults=200&id=" + idList.join(",") + "&key=" + this.key, { json: true }, (err, res, body) => {
            if (err || !body) {
                callback([])
                return
            }

            let channelList = []

            for (let i in body.items) {
                let channel = body.items[i]
                channelList.push({
                    id: channel.id,
                    name: channel.snippet.title,
                    subscribers: channel.statistics.subscriberCount,
                    image: channel.snippet.thumbnails.default.url
                })
            }

            callback(channelList)
        })
    }

    getVideo(videoId, callback) {
        this.getVideoInfo([videoId], callback)
    }

    getSearch(searchTerm, callback) {
        request(YouTube.API_BASE_URL + "/search?part=id&type=video&q=" + encodeURIComponent(searchTerm) + "&maxResults=" + YouTube.MAX_SEARCH_RESULTS + "&key=" + this.key, { json: true }, (err, res, body) => {
            if (err || !body) {
                callback([])
                return
            }

            let idList = []
            for (let i in body.items) {
                idList.push(body.items[i].id.videoId)
            }

            this.getVideoInfo(idList, callback)
        })
    }

    getPlaylist(playlistId, callback) {
        let pageCount = Math.ceil(YouTube.MAX_PLAYLIST_RESULTS / 50)
        let pageToken = ""

        let playlistVideos = []

        const getPlaylistVideos = () => {
            request(YouTube.API_BASE_URL + "/playlistItems?part=contentDetails&maxResults=50&playlistId=" + playlistId + "&key=" + this.key + pageToken, { json: true }, (err, res, body) => {
                if (err || !body) {
                    callback(playlistVideos)
                    return
                }

                pageToken = "&pageToken=" + body.nextPageToken

                let idList = []
                for (let i in body.items) {
                    idList.push(body.items[i].contentDetails.videoId)
                }

                this.getVideoInfo(idList, (videoList) => {
                    playlistVideos = playlistVideos.concat(videoList)

                    if (pageCount > 0 && pageToken !== "&pageToken=undefined") {
                        pageCount--
                        getPlaylistVideos()
                    } else {
                        callback(playlistVideos)
                    }
                })
            })
        }

        getPlaylistVideos()
    }

    parse(searchTerm) {
        const video = searchTerm.match(/(?:[?&]v=|youtu\.be\/|shorts\/)([\w-]{11})/)
        if (video) {
            return { type: "v", value: video[1] }
        }

        const playlist = searchTerm.match(/[?&]list=([\w-]+)/)
        if (playlist) {
            return { type: "p", value: playlist[1] }
        }

        return { type: "s", value: searchTerm }
    }
}