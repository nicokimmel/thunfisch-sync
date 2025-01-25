import request from "request"

export default class SponsorBlock {

    static API_BASE_URL = "https://sponsor.ajay.app/api/skipSegments?videoID="

    load(videoId, callback) {
        request(SponsorBlock.API_BASE_URL + videoId, { json: true }, (err, res, body) => {
            if (res.statusCode != 200) {
                return
            }

            let segmentList = []

            for (let i in body) {
                const segment = body[i].segment
                segmentList.push({
                    from: Math.round(segment[0]),
                    to: Math.round(segment[1])
                })
            }

            callback(segmentList)
        })
    }

    check(time, segmentList) {
        if (segmentList.length === 0) {
            return false
        }

        for (let i = 0; i < segmentList.length; i++) {
            const segment = segmentList[i]
            if (time > segment.from && time < segment.to) {
                segmentList.splice(i, 1)
                return segment.to
            }
        }

        return false
    }
}