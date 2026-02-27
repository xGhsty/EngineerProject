import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, type UserInfo } from "../../api/dashboard";
import { updateUsername, changePassword } from "../../api/userSettings";
import { useDarkMode } from "../../hooks/useDarkMode";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import "./Settings.css";
import { useEffect } from "react";

export default function Settings() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "password" | "preferences">("profile");
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    const [username, setUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState<{ text: string; ok: boolean } | null>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState<{ text: string; ok: boolean } | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await getUserInfo();
            setUserInfo(user);
            setUsername(user.username);
            setLoading(false);
        } catch (error) {
            console.error('Error loading user data:', error);
            setLoading(false);
        }
    };

    const handleUsernameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUsernameMessage(null);
        try {
            await updateUsername(username);
            setUsernameMessage({ text: "Nazwa użytkownika zaktualizowana!", ok: true });
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Błąd podczas aktualizacji";
            setUsernameMessage({ text: msg, ok: false });
        }
    };

    const reqItem = (ok: boolean, label: string, neutral = false) => (
        <div className={`req-item ${neutral ? 'neutral' : ok ? 'ok' : 'fail'}`}>
            <i className={`bi bi-${neutral ? 'circle' : ok ? 'check-circle-fill' : 'x-circle-fill'}`}></i>
            {label}
        </div>
    );

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (newPassword.length < 6) {
            setPasswordMessage({ text: "Nowe hasło musi mieć minimum 6 znaków.", ok: false });
            return;
        }
        if (newPassword === currentPassword) {
            setPasswordMessage({ text: "Nowe hasło musi różnić się od aktualnego.", ok: false });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ text: "Nowe hasło i potwierdzenie muszą być takie same.", ok: false });
            return;
        }

        try {
            await changePassword(currentPassword, newPassword, confirmPassword);
            setPasswordMessage({ text: "Hasło zostało zmienione!", ok: true });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Wystąpił błąd podczas zmiany hasła.";
            setPasswordMessage({ text: msg, ok: false });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const userRole = localStorage.getItem('role');

    if (loading) {
        return <div className="loading">Ładowanie...</div>;
    }

    return (
        <div className="settings-container">
            <button
                className={`hamburger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </button>

            {menuOpen && (
                <div
                    className="overlay"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
                <div className="logo">ParkRent</div>
                <div className="user-info">
                    <div className="avatar">
                        {userInfo?.name?.[0]}{userInfo?.surname?.[0]}
                    </div>
                    <div className="user-details">
                        <p className="greeting">Cześć {userInfo?.username?.trim() || userInfo?.name}!</p>
                    </div>
                </div>

                <DarkModeToggle isDark={isDark} onToggle={toggle} />

                <nav className="menu">
                    {(userRole === "DistrictAdmin" || userRole === "SuperAdmin") && (
                        <button
                            className={`menu-item ${window.location.pathname === '/admin' ? 'active' : ''}`}
                            onClick={() => navigate('/admin')}
                        >
                            <i className='bi bi-people'></i> Panel Admina
                        </button>
                    )}

                    <button
                        className={`menu-item ${window.location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                    >
                        <i className='bi bi-map'></i> Mapa parkingów
                    </button>

                    <button
                        className={`menu-item ${window.location.pathname === '/my-parking-spots' ? 'active' : ''}`}
                        onClick={() => navigate('/my-parking-spots')}
                    >
                        <i className='bi bi-car-front'></i> Moje miejsca parkingowe
                    </button>

                    <button
                        className={`menu-item ${window.location.pathname === '/my-reservations' ? 'active' : ''}`}
                        onClick={() => navigate('/my-reservations')}
                    >
                        <i className='bi bi-clock-history'></i> Moje rezerwacje
                    </button>

                    <button
                        className={`menu-item ${window.location.pathname === '/settings' ? 'active' : ''}`}
                        onClick={() => navigate('/settings')}
                    >
                        <i className='bi bi-gear'></i> Ustawienia
                    </button>

                    <button className="menu-item logout" onClick={handleLogout}>
                        <i className='bi bi-box-arrow-right'></i> Wyloguj się
                    </button>
                </nav>
            </aside>

            <main className="settings-main-content">
                <h1>Ustawienia</h1>

                <div className="settings-tabs">
                    <button
                        className={`settings-tab-button ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        <i className="bi bi-person-circle"></i> Profil
                    </button>
                    <button
                        className={`settings-tab-button ${activeTab === "password" ? "active" : ""}`}
                        onClick={() => setActiveTab("password")}
                    >
                        <i className="bi bi-key"></i> Hasło
                    </button>
                    <button
                        className={`settings-tab-button ${activeTab === "preferences" ? "active" : ""}`}
                        onClick={() => setActiveTab("preferences")}
                    >
                        <i className="bi bi-palette"></i> Preferencje
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === "profile" && (
                        <div className="settings-panel">
                            <h2>Zmień nazwę użytkownika</h2>
                            <form onSubmit={handleUsernameUpdate} className="settings-form">
                                <div className="form-group">
                                    <label>Nazwa użytkownika</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="settings-input"
                                        minLength={3}
                                        maxLength={50}
                                        required
                                    />
                                </div>
                                {usernameMessage && (
                                    <p className={`settings-message ${usernameMessage.ok ? 'success' : 'error'}`}>
                                        {usernameMessage.text}
                                    </p>
                                )}
                                <button type="submit" className="save-button">
                                    <i className="bi bi-check-circle"></i> Zapisz zmiany
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "password" && (
                        <div className="settings-panel">
                            <h2>Zmień hasło</h2>
                            <form onSubmit={handlePasswordChange} className="settings-form">
                                <div className="form-group">
                                    <label>Aktualne hasło</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="settings-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nowe hasło</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="settings-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Potwierdź nowe hasło</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="settings-input"
                                        required
                                    />
                                </div>

                                {newPassword.length > 0 && (
                                    <div className="password-requirements">
                                        {reqItem(newPassword.length >= 6, 'Minimum 6 znaków')}
                                        {reqItem(
                                            currentPassword.length > 0 && newPassword !== currentPassword,
                                            'Różni się od aktualnego hasła',
                                            currentPassword.length === 0
                                        )}
                                        {reqItem(
                                            confirmPassword.length > 0 && newPassword === confirmPassword,
                                            'Hasła są zgodne',
                                            confirmPassword.length === 0
                                        )}
                                    </div>
                                )}

                                {passwordMessage && (
                                    <p className={`settings-message ${passwordMessage.ok ? 'success' : 'error'}`}>
                                        {passwordMessage.text}
                                    </p>
                                )}
                                <button type="submit" className="save-button">
                                    <i className="bi bi-check-circle"></i> Zmień hasło
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "preferences" && (
                        <div className="settings-panel">
                            <h2>Preferencje</h2>
                            <div className="preference-item">
                                <div className="preference-info">
                                    <h3>Tryb ciemny</h3>
                                    <p>Przełączaj między jasnym a ciemnym motywem aplikacji</p>
                                </div>
                                <DarkModeToggle isDark={isDark} onToggle={toggle} />
                            </div>
                            <div className="preference-item">
                                <div className="preference-info">
                                    <h3>Język aplikacji</h3>
                                    <p>Wybierz preferowany język interfejsu</p>
                                </div>
                                <select className="preference-select">
                                    <option value="pl">Polski</option>
                                    <option value="en" disabled>English (wkrótce)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
