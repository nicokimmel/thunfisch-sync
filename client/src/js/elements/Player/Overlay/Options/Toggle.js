import "../../../../../scss/elements/player/overlay/options/toggle.scss"

export default function Toggle({ checked, onCheck }) {
    return (
        <label className="toggle">
            <input type="checkbox" checked={checked} onChange={onCheck} />
            <span />
        </label>
    )
}