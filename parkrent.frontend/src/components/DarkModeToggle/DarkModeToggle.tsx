import './DarkModeToggle.css';

interface DarkModeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

export default function DarkModeToggle({ isDark, onToggle }: DarkModeToggleProps) {
    return (
        <div className="dark-mode-toggle-container">
            <span className="dark-mode-label">
                {isDark ? 'Tryb Ciemny' : 'Tryb Jasny'}
            </span>
            <button
                className={`dark-mode-toggle ${isDark ? 'dark' : 'light'}`}
                onClick={onToggle}
                aria-label="Toggle dark mode"
            >
                <div className="toggle-thumb">
                    <i className={`bi ${isDark ? 'bi-moon-fill' : 'bi-sun-fill'}`}></i>
                </div>
            </button>
        </div>
    );
}
