import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserInfo, type UserInfo } from "../../api/dashboard";
import { getUsers, getDistricts, getParkingSpots, assignUserToDistrict, changeUserRole, createParkingSpot, assignParkingSpotToUser, deleteParkingSpot, createDistrict, deleteDistrict, deleteUser, getReservationHistory,
    type AdminUser,
    type District,
    type AdminParkingSpot,
    type ReservationLogEntry
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
    const [activeTab, setActiveTab] = useState<"users" | "parking" | "districts" | "logs">("users");
    const [reservationLogs, setReservationLogs] = useState<ReservationLogEntry[]>([]);
    const [searchLogs, setSearchLogs] = useState("");
    const [newSpotName, setNewSpotName] = useState("");
    const [newSpotDistrict, setNewSpotDistrict] = useState("");
    const [newDistrictName, setNewDistrictName] = useState("");
    const [searchUsers, setSearchUsers] = useState("");
    const [searchDistricts, setSearchDistricts] = useState("");
    const [searchParking, setSearchParking] = useState("");
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'district' | 'user' | 'parking'; id: string; name: string } | null>(null);
    const [hoursPopup, setHoursPopup] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    const userRole = localStorage.getItem('role');

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const [user, usersData, districtsData, spotsData, logsData] = await Promise.all([
                getUserInfo(),
                getUsers(),
                getDistricts(),
                getParkingSpots(),
                getReservationHistory()
            ]);

            setUserInfo(user);
            setUsers(usersData);
            setDistricts(districtsData);
            setParkingSpots(spotsData);
            setReservationLogs(logsData);
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
        const districtId = userRole === "SuperAdmin" ? newSpotDistrict : (userInfo?.districtId ?? "");
        if (!newSpotName || !districtId) return;

        try {
            await createParkingSpot(newSpotName, districtId);
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

    const handleDeleteParkingSpot = (spotId: string, spotName: string) => {
        setDeleteError(null);
        setConfirmDelete({ type: 'parking', id: spotId, name: spotName });
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

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        setDeleteError(null);
        try {
            if (confirmDelete.type === 'district') {
                await deleteDistrict(confirmDelete.id);
            } else if (confirmDelete.type === 'parking') {
                await deleteParkingSpot(confirmDelete.id);
            } else {
                await deleteUser(confirmDelete.id);
            }
            setConfirmDelete(null);
            loadAdminData();
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Nie udało się usunąć.';
            setDeleteError(msg);
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
                    <button
                        className={`tab-button ${activeTab === "logs" ? "active" : ""}`}
                        onClick={() => setActiveTab("logs")}
                    >
                        <i className="bi bi-clock-history"></i> Historia rezerwacji
                    </button>
                </div>

                {activeTab === "users" && (
                    <div className="tab-content">
                        <div className="search-bar">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder={userRole === "SuperAdmin" ? "Szukaj po nazwie, emailu, dzielnicy..." : "Szukaj użytkowników..."}
                                value={searchUsers}
                                onChange={(e) => setSearchUsers(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="users-grid">
                            {users.filter(u => {
                                const q = searchUsers.toLowerCase();
                                const baseMatch = `${u.name} ${u.surname} ${u.username} ${u.email}`.toLowerCase().includes(q);
                                const districtMatch = userRole === "SuperAdmin" && (u.districtName ?? "").toLowerCase().includes(q);
                                return baseMatch || districtMatch;
                            }).map(user => (
                                <div key={user.id} className="user-card">
                                    <div className="user-card-header">
                                        <div className="user-avatar">
                                            {user.name[0]}{user.surname[0]}
                                        </div>
                                        <div className="user-info-card">
                                            <h3>{user.name} {user.surname}</h3>
                                            <p className="user-username">@{user.username}</p>
                                            <p className="user-email">{user.email}</p>
                                            {user.createdAt && (
                                                <p className="user-created-at">
                                                    <i className="bi bi-calendar-check"></i> Konto utworzone: {new Date(user.createdAt).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="user-controls">
                                        {userRole === "SuperAdmin" && (
                                            <div className="control-group">
                                                <label>Rola:</label>
                                                <select
                                                    value={displayRole(user.role)}
                                                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                    className="control-select"
                                                >
                                                    <option value="User">Użytkownik</option>
                                                    <option value="DistrictAdmin">Admin dzielnicy</option>
                                                    <option value="SuperAdmin">Super Admin</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="control-group">
                                            <label>Dzielnica:</label>
                                            {userRole === "SuperAdmin" ? (
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
                                            ) : (
                                                <select
                                                    value={user.districtId === userInfo?.districtId ? (user.districtId || "") : ""}
                                                    onChange={(e) => handleAssignDistrict(user.id, e.target.value)}
                                                    className="control-select"
                                                >
                                                    <option value="">Brak przypisania</option>
                                                    {userInfo?.districtId && (
                                                        <option value={userInfo.districtId}>
                                                            {userInfo.districtName}
                                                        </option>
                                                    )}
                                                </select>
                                            )}
                                        </div>

                                        <div className="user-role-badge">{displayRole(user.role)}</div>

                                        {userRole === 'SuperAdmin' && user.role !== 'SuperAdmin' && (
                                            <button
                                                className="delete-btn delete-btn-user"
                                                onClick={() => { setDeleteError(null); setConfirmDelete({ type: 'user', id: user.id, name: `${user.name} ${user.surname}` }); }}
                                            >
                                                <i className="bi bi-trash"></i> Usuń użytkownika
                                            </button>
                                        )}
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
                                    onChange={(e) => setNewDistrictName(e.target.value.slice(0, 30))}
                                    className="form-input"
                                    maxLength={30}
                                    required
                                />
                                <button type="submit" className="create-button">
                                    <i className="bi bi-plus-circle"></i> Dodaj dzielnicę
                                </button>
                            </div>
                        </form>

                        <div className="search-bar">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Szukaj dzielnic..."
                                value={searchDistricts}
                                onChange={(e) => setSearchDistricts(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="districts-grid">
                            {districts.filter(d =>
                                d.name.toLowerCase().includes(searchDistricts.toLowerCase())
                            ).map(district => (
                                <div key={district.id} className="district-card">
                                    <div className="district-icon">
                                        <i className="bi bi-geo-alt-fill"></i>
                                    </div>
                                    <h3>{district.name}</h3>
                                    <button
                                        className="delete-btn"
                                        onClick={() => { setDeleteError(null); setConfirmDelete({ type: 'district', id: district.id, name: district.name }); }}
                                    >
                                        <i className="bi bi-trash"></i> Usuń
                                    </button>
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
                                {userRole === "SuperAdmin" ? (
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
                                ) : (
                                    <span className="district-label-badge">
                                        <i className="bi bi-geo-alt-fill"></i> {userInfo?.districtName}
                                    </span>
                                )}
                                <button type="submit" className="create-button">
                                    <i className="bi bi-plus-circle"></i> Dodaj
                                </button>
                            </div>
                        </form>

                        <div className="search-bar">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Szukaj miejsc parkingowych..."
                                value={searchParking}
                                onChange={(e) => setSearchParking(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="parking-spots-grid">
                            {parkingSpots.filter(s =>
                                `${s.name} ${s.districtName} ${s.ownerName ?? ''}`.toLowerCase().includes(searchParking.toLowerCase())
                            ).map(spot => (
                                <div key={spot.id} className="parking-spot-card">
                                    <div className="spot-card-header">
                                        <h3>{spot.name}</h3>
                                        <div className="spot-header-actions">
                                            {spot.availableFrom && spot.availableTo && (
                                                <div className="hours-popup-wrapper">
                                                    <button
                                                        className="hours-info-btn"
                                                        onClick={() => setHoursPopup(hoursPopup === spot.id ? null : spot.id)}
                                                        title="Godziny dostępności"
                                                    >
                                                        <i className="bi bi-clock"></i>
                                                    </button>
                                                    {hoursPopup === spot.id && (
                                                        <div className="hours-popup">
                                                            Dostępne: {spot.availableFrom} – {spot.availableTo}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleDeleteParkingSpot(spot.id, spot.name)}
                                                className="delete-button"
                                                title="Usuń miejsce"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
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

            {activeTab === "logs" && (
                <div className="tab-content">
                    <div className="search-bar">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Szukaj po użytkowniku, miejscu, dzielnicy..."
                            value={searchLogs}
                            onChange={(e) => setSearchLogs(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="logs-table-wrapper">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Użytkownik</th>
                                    <th>Miejsce</th>
                                    <th>Dzielnica</th>
                                    <th>Od</th>
                                    <th>Do</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservationLogs
                                    .filter(r =>
                                        `${r.userName} ${r.parkingSpotName} ${r.districtName}`
                                            .toLowerCase()
                                            .includes(searchLogs.toLowerCase())
                                    )
                                    .map(r => (
                                        <tr key={r.id}>
                                            <td>{r.userName}</td>
                                            <td>{r.parkingSpotName}</td>
                                            <td>{r.districtName}</td>
                                            <td>{new Date(r.startTime).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td>{new Date(r.endTime).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td>
                                                <span className={`status-badge status-${r.status === 'Aktywna' ? 'active' : r.status === 'Zakończona' ? 'completed' : r.status === 'Nadchodząca' ? 'upcoming' : 'cancelled'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                }
                                {reservationLogs.filter(r =>
                                    `${r.userName} ${r.parkingSpotName} ${r.districtName}`
                                        .toLowerCase()
                                        .includes(searchLogs.toLowerCase())
                                ).length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="logs-empty">Brak rezerwacji do wyświetlenia</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <h3>Potwierdź usunięcie</h3>
                        <p>
                            Czy na pewno chcesz usunąć{' '}
                            <strong>{confirmDelete.type === 'district' ? 'dzielnicę' : confirmDelete.type === 'parking' ? 'miejsce parkingowe' : 'użytkownika'} „{confirmDelete.name}"</strong>?
                            {confirmDelete.type === 'district' && (
                                <span className="confirm-warning"> Ta operacja usunie wszystkie miejsca parkingowe w tej dzielnicy.</span>
                            )}
                        </p>
                        {deleteError && <p className="confirm-error">{deleteError}</p>}
                        <div className="confirm-actions">
                            <button className="confirm-btn-cancel" onClick={() => setConfirmDelete(null)}>
                                Anuluj
                            </button>
                            <button className="confirm-btn-confirm" onClick={handleConfirmDelete}>
                                <i className="bi bi-trash"></i> Usuń
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
