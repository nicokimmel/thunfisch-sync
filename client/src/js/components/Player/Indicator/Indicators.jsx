import "./Indicators.scss"

import { CSSTransition } from "react-transition-group"

import UseFlash from "../../../hooks/UseFlash.jsx"

export default function Indicators({ playing, keys }) {
    const showPlaying = UseFlash(playing)
    const showRewind = UseFlash(keys.ArrowLeft)
    const showForward = UseFlash(keys.ArrowRight)

    const indicatorList = [
        {
            in: showPlaying,
            className: `indicator-playing ${playing ? "icon-play" : "icon-pause"}`
        },
        {
            in: showRewind,
            className: "indicator-rewind icon-play"
        },
        {
            in: showForward,
            className: "indicator-forward icon-play"
        }
    ]

    return (
        <div className="indicators">
            {
                indicatorList.map((indicator, index) => (
                    <CSSTransition
                        key={index}
                        in={indicator.in}
                        timeout={100}
                        classNames="scale"
                        mountOnEnter
                        unmountOnExit
                    >
                        <span className={indicator.className} />
                    </CSSTransition>
                ))
            }
        </div>
    )
}