import "./Button.scss"

export default function Button({ icon, onClick }) {
    return (
        <button className={icon} onClick={onClick} />
    )
}