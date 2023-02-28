const SponsorBlock = class {
	constructor() {
		this.request = require("request")
		this.url = "https://sponsor.ajay.app/api/skipSegments?videoID="
	}
	
	getSegments(room) {
		this.request(this.url + room.video.id, { json: true }, (err, res, body) => {
			if(res.statusCode != 200) {
				room.video.sponsors = []
				return
			}
			var sponsorList = []
			for(var i in body) {
				var segment = body[i].segment
				sponsorList.push({
					from: Math.round(segment[0]),
					to: Math.round(segment[1])
				})
			}
			room.video.sponsors = sponsorList
		})
	}
	
	check(time, segments) {
		if(!segments || segments.length == 0) {
			return false
		}
		var segment = segments[0]
		if(time > segment.to) {
			segments.shift()
			return this.check(time, segments)
		}
		if(time > segment.from && time < segment.to) {
			return segment.to
		}
		return false
	}
}