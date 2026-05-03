const isString = (v) => typeof v === "string" && v.length > 0
const isOptionalString = (v) => v === undefined || isString(v)
const isObject = (v) => typeof v === "object" && v !== null
const isPositiveOrMinusOne = (v) => typeof v === "number" && Number.isFinite(v) && (v === -1 || v > 0)
const isStringArray = (v) => Array.isArray(v) && v.every(isString)

function check(obj, rules) {
    for (const [key, validator] of Object.entries(rules)) {
        if (!validator(obj[key])) {
            return { valid: false, error: `Invalid "${key}"` }
        }
    }
    return { valid: true }
}

export function validateVideo(video) {
    if (!isObject(video)) {
        return { valid: false, error: "Video is not an object" }
    }

    const result = check(video, {
        id: isString,
        title: isString,
        thumbnail: isString,
        duration: isPositiveOrMinusOne,
        views: isString,
        language: isOptionalString,
        tags: isStringArray,
        channel: isObject,
    })
    if (!result.valid) return result

    return check(video.channel, {
        id: isString,
        name: isString,
        subscribers: isString,
        image: isString,
    })
}

export function validateVideoList(videoList) {
    if (!Array.isArray(videoList)) {
        return { valid: false, error: "Video list is not an array" }
    }
    if (videoList.length === 0) {
        return { valid: false, error: "Video list is empty" }
    }
    for (let i = 0; i < videoList.length; i++) {
        const result = validateVideo(videoList[i])
        if (!result.valid) {
            return { valid: false, error: `Video[${i}]: ${result.error}` }
        }
    }
    return { valid: true }
}

export function validateRoomId(roomId) {
    if (typeof roomId !== "string" || roomId.length === 0) {
        return { valid: false, error: "Room ID must be a non-empty string" }
    }
    return { valid: true }
}

export function validateSeekTime(time) {
    if (typeof time !== "number" || !Number.isFinite(time)) {
        return { valid: false, error: "Seek time must be a finite number" }
    }
    return { valid: true }
}

export function validateSpeed(speed) {
    if (typeof speed !== "number" || !Number.isFinite(speed)) {
        return { valid: false, error: "Speed must be a finite number" }
    }
    if (speed < 0.1 || speed > 5) {
        return { valid: false, error: "Speed must be between 0.1 and 5" }
    }
    return { valid: true }
}

export function validateSearchTerm(searchTerm) {
    if (typeof searchTerm !== "string" || searchTerm.length === 0) {
        return { valid: false, error: "Search term must be a non-empty string" }
    }
    return { valid: true }
}

export function validateQueuePos(queuePos) {
    if (queuePos == null) {
        return { valid: true }
    }
    if (typeof queuePos !== "number" || !Number.isFinite(queuePos)) {
        return { valid: false, error: "Queue position must be a finite number" }
    }
    return { valid: true }
}

export function validateQueueIndex(index) {
    if (typeof index !== "number" || !Number.isInteger(index) || index < 0) {
        return { valid: false, error: "Queue index must be a non-negative integer" }
    }
    return { valid: true }
}

export function validateQueueMove(from, to, queueLength) {
    if (typeof from !== "number" || !Number.isInteger(from) || from < 0 || from >= queueLength) {
        return { valid: false, error: "From index must be an integer within queue range" }
    }
    if (typeof to !== "number" || !Number.isFinite(to)) {
        return { valid: false, error: "To index must be a finite number" }
    }
    return { valid: true }
}
