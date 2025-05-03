import "./Spacer.scss"

export default function Spacer({ type }) {
    return (
        <div className={`spacer ${type || "grow"}`} />
    )
}