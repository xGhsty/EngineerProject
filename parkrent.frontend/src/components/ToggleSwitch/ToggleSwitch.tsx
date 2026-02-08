import './ToggleSwitch.css';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    label?: string;
}

export default function ToggleSwitch({ checked, onChange, disabled = false, label }: ToggleSwitchProps) {
    return (
        <div className="toggle-switch-container">
            {label && <span className="toggle-label">{label}</span>}
            <label className="toggle-switch">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="toggle-slider">
                    <i className={`bi bi-lock-fill lock-icon ${!checked ? 'active' : ''}`}></i>
                    <i className={`bi bi-unlock-fill unlock-icon ${checked ? 'active' : ''}`}></i>
                </span>
            </label>
        </div>
    );
}
