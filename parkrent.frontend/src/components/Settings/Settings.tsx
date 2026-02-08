import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, type UserInfo } from "../../api/dashboard";
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

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const user = await getUserInfo();
            setUserInfo(user);
            setName(user.name);
            setSurname(user.surname);
            setEmail(user.email);
            setLoading(false);
        } catch (error) {
            console.error('Error loading user data:', error);
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement profile update API call
        alert("Funkcjonalność w trakcie implementacji");
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Nowe hasła nie są zgodne!");
            return;
        }
        // TODO: Implement password change API call
        alert("Funkcjonalność w trakcie implementacji");
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
                        <p className="greeting">Cześć {userInfo?.name}!</p>
                    </div>
                </div>

                <DarkModeToggle isDark={isDark} onToggle={toggle} />

                <nav className="menu">
                    <button
                        className={`menu-item ${window.location.pathname === '/dashboard' ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard')}
                    >
                        <i className='bi bi-p-square'></i> Dostępne miejsca
                    </button>

                    {(userRole === "DistrictAdmin" || userRole === "SuperAdmin") && (
                        <button
                            className={`menu-item ${window.location.pathname === '/admin' ? 'active' : ''}`}
                            onClick={() => navigate('/admin')}
                        >
                            <i className='bi bi-people'></i> Panel Admina
                        </button>
                    )}

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
                            <h2>Dane profilu</h2>
                            <form onSubmit={handleProfileUpdate} className="settings-form">
                                <div className="form-group">
                                    <label>Imię</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="settings-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nazwisko</label>
                                    <input
                                        type="text"
                                        value={surname}
                                        onChange={(e) => setSurname(e.target.value)}
                                        className="settings-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="settings-input"
                                        required
                                    />
                                </div>
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
