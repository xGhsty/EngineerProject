import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, type UserInfo } from "../../api/dashboard";
import { getUsers, getDistricts, getParkingSpots, assignUserToDistrict, changeUserRole, createParkingSpot, assignParkingSpotToUser, deleteParkingSpot, createDistrict,
    type AdminUser,
    type District,
    type AdminParkingSpot
} from "../../api/admin";
import { useDarkMode } from "../../hooks/useDarkMode";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import "./AdminPanel.css";

export default function AdminPanel() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [parkingSpots, setParkingSpots] = useState<AdminParkingSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"users" | "parking" | "districts">("users");
    const [newSpotName, setNewSpotName] = useState("");
    const [newSpotDistrict, setNewSpotDistrict] = useState("");
    const [newDistrictName, setNewDistrictName] = useState("");
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    const userRole = localStorage.getItem('role');

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const [user, usersData, districtsData, spotsData] = await Promise.all([
                getUserInfo(),
                getUsers(),
                getDistricts(),
                getParkingSpots()
            ]);

            setUserInfo(user);
            setUsers(usersData);
            setDistricts(districtsData);
            setParkingSpots(spotsData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading admin data:', error);
            setLoading(false);
        }
    };

    const handleAssignDistrict = async (userId: string, districtId: string) => {
        try {
            await assignUserToDistrict(userId, districtId);
            loadAdminData();
        } catch (error) {
            console.error('Error assigning district:', error);
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            await changeUserRole(userId, newRole);
            loadAdminData();
        } catch (error) {
            console.error('Error changing role:', error);
        }
    };

    const handleCreateParkingSpot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSpotName || !newSpotDistrict) return;

        try {
            await createParkingSpot(newSpotName, newSpotDistrict);
            setNewSpotName("");
            setNewSpotDistrict("");
            loadAdminData();
        } catch (error) {
            console.error('Error creating parking spot:', error);
        }
    };

    const handleAssignParkingSpot = async (spotId: string, userId: string) => {
        try {
            await assignParkingSpotToUser(spotId, userId);
            loadAdminData();
        } catch (error) {
            console.error('Error assigning parking spot:', error);
        }
    };

    const handleDeleteParkingSpot = async (spotId: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć to miejsce parkingowe?')) {
            return;
        }

        try {
            await deleteParkingSpot(spotId);
            loadAdminData();
        } catch (error) {
            console.error('Error deleting parking spot:', error);
        }
    };

    const handleCreateDistrict = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDistrictName) return;

        try {
            await createDistrict(newDistrictName);
            setNewDistrictName("");
            loadAdminData();
        } catch (error) {
            console.error('Error creating district:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const displayRole = (role: string) => {
        return role === 'Admin' ? 'DistrictAdmin' : role;
    };

    if (loading) {
        return <div className="loading">Ładowanie...</div>;
    }

    return (
        <div className="admin-panel-container">
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

            <main className="admin-main-content">
                <h1 className="admin-title">Panel Administracyjny</h1>

                <div className="admin-tabs">
                    <button
                        className={`tab-button ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        <i className="bi bi-people"></i> Użytkownicy
                    </button>
                    {userRole === "SuperAdmin" && (
                        <button
                            className={`tab-button ${activeTab === "districts" ? "active" : ""}`}
                            onClick={() => setActiveTab("districts")}
                        >
                            <i className="bi bi-geo-alt"></i> Dzielnice
                        </button>
                    )}
                    <button
                        className={`tab-button ${activeTab === "parking" ? "active" : ""}`}
                        onClick={() => setActiveTab("parking")}
                    >
                        <i className="bi bi-p-square"></i> Miejsca parkingowe
                    </button>
                </div>

                {activeTab === "users" && (
                    <div className="tab-content">
                        <div className="users-grid">
                            {users.map(user => (
                                <div key={user.id} className="user-card">
                                    <div className="user-card-header">
                                        <div className="user-avatar">
                                            {user.name[0]}{user.surname[0]}
                                        </div>
                                        <div className="user-info-card">
                                            <h3>{user.name} {user.surname}</h3>
                                            <p className="user-username">@{user.username}</p>
                                            <p className="user-email">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="user-controls">
                                        <div className="control-group">
                                            <label>Rola:</label>
                                            <select
                                                value={displayRole(user.role)}
                                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                className="control-select"
                                                disabled={userRole !== "SuperAdmin"}
                                            >
                                                <option value="User">Użytkownik</option>
                                                <option value="DistrictAdmin">Admin dzielnicy</option>
                                                {userRole === "SuperAdmin" && (
                                                    <option value="SuperAdmin">Super Admin</option>
                                                )}
                                            </select>
                                        </div>

                                        <div className="control-group">
                                            <label>Dzielnica:</label>
                                            <select
                                                value={user.districtId || ""}
                                                onChange={(e) => handleAssignDistrict(user.id, e.target.value)}
                                                className="control-select"
                                            >
                                                <option value="">Brak przypisania</option>
                                                {districts.map(district => (
                                                    <option key={district.id} value={district.id}>
                                                        {district.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {user.districtName && (
                                            <div className="user-district-badge">
                                                <i className="bi bi-geo-alt-fill"></i> {user.districtName}
                                            </div>
                                        )}

                                        <div className="user-role-badge">{displayRole(user.role)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "districts" && userRole === "SuperAdmin" && (
                    <div className="tab-content">
                        <form onSubmit={handleCreateDistrict} className="create-spot-form">
                            <h2>Dodaj nową dzielnicę</h2>
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="Nazwa dzielnicy (np. Śródmieście)"
                                    value={newDistrictName}
                                    onChange={(e) => setNewDistrictName(e.target.value)}
                                    className="form-input"
                                    required
                                />
                                <button type="submit" className="create-button">
                                    <i className="bi bi-plus-circle"></i> Dodaj dzielnicę
                                </button>
                            </div>
                        </form>

                        <div className="districts-grid">
                            {districts.map(district => (
                                <div key={district.id} className="district-card">
                                    <div className="district-icon">
                                        <i className="bi bi-geo-alt-fill"></i>
                                    </div>
                                    <h3>{district.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "parking" && (
                    <div className="tab-content">
                        <form onSubmit={handleCreateParkingSpot} className="create-spot-form">
                            <h2>Dodaj nowe miejsce parkingowe</h2>
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="Nazwa miejsca (np. P-101)"
                                    value={newSpotName}
                                    onChange={(e) => setNewSpotName(e.target.value)}
                                    className="form-input"
                                    required
                                />
                                <select
                                    value={newSpotDistrict}
                                    onChange={(e) => setNewSpotDistrict(e.target.value)}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Wybierz dzielnicę</option>
                                    {districts.map(district => (
                                        <option key={district.id} value={district.id}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                                <button type="submit" className="create-button">
                                    <i className="bi bi-plus-circle"></i> Dodaj
                                </button>
                            </div>
                        </form>

                        <div className="parking-spots-grid">
                            {parkingSpots.map(spot => (
                                <div key={spot.id} className="parking-spot-card">
                                    <div className="spot-card-header">
                                        <h3>{spot.name}</h3>
                                        <button
                                            onClick={() => handleDeleteParkingSpot(spot.id)}
                                            className="delete-button"
                                            title="Usuń miejsce"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>

                                    <div className="spot-details">
                                        <div className="spot-badge district-tag">
                                            <i className="bi bi-geo-alt-fill"></i> {spot.districtName}
                                        </div>

                                        {spot.ownerName ? (
                                            <div className="spot-owner">
                                                <i className="bi bi-person-fill"></i> {spot.ownerName}
                                            </div>
                                        ) : (
                                            <div className="spot-unassigned">
                                                <i className="bi bi-dash-circle"></i> Nieprzypisane
                                            </div>
                                        )}

                                        <div className={`spot-status ${spot.isAvailable ? 'available' : 'occupied'}`}>
                                            {spot.isAvailable ? '✓ Dostępne' : '✗ Zajęte'}
                                        </div>
                                    </div>

                                    <div className="spot-assign">
                                        <label>Przypisz do użytkownika:</label>
                                        <select
                                            value={spot.ownerId || ""}
                                            onChange={(e) => handleAssignParkingSpot(spot.id, e.target.value)}
                                            className="assign-select"
                                        >
                                            <option value="">Usuń przypisanie</option>
                                            {users
                                                .filter(u => u.districtId === spot.districtId)
                                                .map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} {user.surname}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
