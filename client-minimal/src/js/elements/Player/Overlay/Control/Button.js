import "../../../../../scss/elements/player/overlay/control/button.scss"

export default function Button({ icon, onClick }) {
    return (
        <button className={icon} onClick={onClick} />
    )
}