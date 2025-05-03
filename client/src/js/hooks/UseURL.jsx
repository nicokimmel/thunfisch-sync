import { useState, useEffect } from "react"

export default function UseURL() {
    const [id, setId] = useState(null)
    const [type, setType] = useState(null)

    useEffect(() => {
        const params = window.location.pathname.split("/").filter(part => part)

        setId(null)
        if (params.length > 0) {
            setId(params[0])
        }

        setType(null)
        if (params.length > 1) {
            setType(params[1])
        }
    }, [window.location.pathname])

    return [id, type]
}