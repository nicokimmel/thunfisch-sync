import "../../scss/elements/viewer.scss"

export default function Viewer({ count }) {
    return (
        <div className="viewer">
            {
                count > 5 ? (
                    <span className="icon-circle-user">{count}</span>
                ) : (
                    Array.from({ length: count }).map((_, index) => (
                        <span className="icon-circle-user" key={index} />
                    ))
                )
            }
        </div>
    )
}