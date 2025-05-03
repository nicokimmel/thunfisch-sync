import "./Search.scss"

import { useEffect, useRef, useState } from "react"

import Video from "./Video/Video.jsx"

export default function Search({
    results, type, onSearch,
    onPlayClick, onAddClick
}) {
    const searchResultRef = useRef(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [searchChanged, setSearchChanged] = useState(false)
    const [hide, setHide] = useState(true)

    const handleSearchInput = (event) => {
        const text = event.target.value

        if (searchTerm !== text) {
            setHide(true)
            setSearchChanged(true)
        }

        setSearchTerm(text)
    }

    const handleSearchButtonClick = () => {
        if (!searchChanged) {
            setHide(false)
            return
        }

        onSearch(searchTerm)
        setSearchChanged(false)
    }

    const handleSearchClearClick = () => {
        setHide(true)
        setSearchTerm("")
        setSearchChanged(true)
    }

    const handleSearchInputEnter = (event) => {
        if (event.key !== "Enter") {
            return
        }

        if (!searchChanged) {
            setHide(false)
            return
        }

        onSearch(searchTerm)
        setSearchChanged(false)
    }

    const handleSearchInputPaste = (event) => {
        let text = event.clipboardData.getData("text")

        if (searchTerm === text) {
            setHide(false)
            return
        }

        setSearchTerm(text)
        onSearch(text)
        setSearchChanged(false)
    }

    const handleSearchInputClick = () => {
        if (!searchChanged && results.length > 0) {
            setHide(false)
        }
    }

    useEffect(() => {
        setHide(results.length === 0)
    }, [results])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!searchResultRef.current.contains(event.target)) {
                setHide(true)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className={"search"} ref={searchResultRef}>
            <input
                className={"search-input"}
                placeholder="Suchen"
                value={searchTerm}
                onInput={handleSearchInput}
                onClick={handleSearchInputClick}
                onKeyDown={handleSearchInputEnter}
                onPaste={handleSearchInputPaste}
            />
            {
                searchTerm !== "" &&
                <button className="search-clear" onClick={handleSearchClearClick} />
            }
            <button className="search-button icon-search" onClick={handleSearchButtonClick}></button>
            <div className={`search-results${hide ? " hide" : ""}`}>
                {
                    type === "p" &&
                    <button
                        onClick={() => {
                            onAddClick(results)
                            setSearchTerm("")
                            setSearchChanged(true)
                            setHide(true)
                        }}
                    >Alle hinzufügen</button>
                }
                {
                    results.map((video, index) =>
                        <Video
                            title={video.title}
                            channel={video.channel.name}
                            thumbnail={video.thumbnail}
                            duration={timeFormat(video.duration)}
                            onPlayClick={() => {
                                onPlayClick([results[index]])
                                setSearchTerm("")
                                setSearchChanged(true)
                                setHide(true)
                            }}
                            onAddClick={() => { onAddClick([results[index]]) }}
                        />
                    )
                }
            </div>
        </div>
    )
}

function timeFormat(duration) {
    const hrs = ~~(duration / 3600)
    const mins = ~~((duration % 3600) / 60)
    const secs = ~~duration % 60

    let time = ""

    if (hrs > 0) {
        time += "" + hrs + ":" + (mins < 10 ? "0" : "")
    }

    time += "" + mins + ":" + (secs < 10 ? "0" : "")
    time += "" + secs

    return time
}