import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyParkingSpots, toggleParkingSpotAvailability, setAvailabilityHours, MyParkingSpot } from "../../api/userParking";
import { getUserInfo, type UserInfo } from "../../api/dashboard";
import { useDarkMode } from "../../hooks/useDarkMode";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import "./MyParkingSpots.css";

export default function MyParkingSpots() {
    const [mySpots, setMySpots] = useState<MyParkingSpot[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editingHours, setEditingHours] = useState<string | null>(null);
    const [tempFrom, setTempFrom] = useState("");
    const [tempTo, setTempTo] = useState("");
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [spots, user] = await Promise.all([
                getMyParkingSpots(),
                getUserInfo()
            ]);
            setMySpots(spots);
            setUserInfo(user);
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
        }
    };

    const loadMySpots = async () => {
        try {
            const spots = await getMyParkingSpots();
            setMySpots(spots);
        } catch (error) {
            console.error('Error loading my parking spots:', error);
        }
    };

    const handleToggleAvailability = async (spotId: string) => {
        try {
            await toggleParkingSpotAvailability(spotId);
            loadMySpots();
        } catch (error: any) {
            console.error("Błąd podczas zmiany dostępności miejsca:", error);
        }
    };

    const handleEditHours = (spot: MyParkingSpot) => {
        setEditingHours(spot.id);
        setTempFrom(spot.availableFrom || "");
        setTempTo(spot.availableTo || "");
    };

    const handleSaveHours = async (spotId: string) => {
        try {
            await setAvailabilityHours(spotId, tempFrom, tempTo);
            setEditingHours(null);
            loadMySpots();
        } catch (error: any) {
            console.error("Błąd podczas zapisywania godzin:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditingHours(null);
        setTempFrom("");
        setTempTo("");
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const userRole = localStorage.getItem('role');

    if (loading){
        return <div className="loading">Ładowanie...</div>
    }

    return (
        <div className="my-parking-spots-container">
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

            <main className="my-parking-main-content">
                <h1>Moje miejsca parkingowe</h1>
                <div className="spots-container">
                    {mySpots.length === 0 ? (
                        <div className="empty-state">
                            <p>Nie masz jeszcze żadnych miejsc parkingowych.</p>
                            <p className="empty-hint">
                                Skontaktuj się z administratorem, aby mieć dostęp do prywatnego miejsca parkingowego.
                            </p>
                        </div>
                    ) : (
                        <div className="my-parking-grid">
                            {mySpots.map(spot => (
                                <div key={spot.id} className="my-parking-card">
                                    <div className="card-header">
                                        <h2>{spot.name}</h2>
                                        <span className="district-badge">{spot.districtName}</span>
                                    </div>

                                    <div className="toggle-section">
                                        <ToggleSwitch
                                            checked={spot.isAvailable}
                                            onChange={() => handleToggleAvailability(spot.id)}
                                            disabled={!!spot.currentReservation}
                                            label="Zablokować miejsce parkingowe?"
                                        />
                                        {spot.currentReservation && (
                                            <p className="toggle-info">
                                                Nie można zablokować miejsca w trakcie aktywnej rezerwacji
                                            </p>
                                        )}
                                    </div>

                                    <div className="availability-hours-section">
                                        <strong>Godziny dostępności:</strong>
                                        {editingHours === spot.id ? (
                                            <div className="hours-edit-form">
                                                <div className="hours-inputs">
                                                    <label>
                                                        Od:
                                                        <input
                                                            type="time"
                                                            value={tempFrom}
                                                            onChange={(e) => setTempFrom(e.target.value)}
                                                            className="time-input"
                                                        />
                                                    </label>
                                                    <label>
                                                        Do:
                                                        <input
                                                            type="time"
                                                            value={tempTo}
                                                            onChange={(e) => setTempTo(e.target.value)}
                                                            className="time-input"
                                                        />
                                                    </label>
                                                </div>
                                                <div className="hours-buttons">
                                                    <button
                                                        className="save-hours-button"
                                                        onClick={() => handleSaveHours(spot.id)}
                                                    >
                                                        Zapisz
                                                    </button>
                                                    <button
                                                        className="cancel-hours-button"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        Anuluj
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="hours-display">
                                                {spot.availableFrom && spot.availableTo ? (
                                                    <p className="hours-text">
                                                        {spot.availableFrom} - {spot.availableTo}
                                                    </p>
                                                ) : (
                                                    <p className="hours-text">Brak ograniczeń czasowych</p>
                                                )}
                                                <button
                                                    className="edit-hours-button"
                                                    onClick={() => handleEditHours(spot)}
                                                >
                                                    <i className="bi bi-pencil"></i> Edytuj
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {spot.currentReservation && (
                                        <div className="current-reservation">
                                            <strong>Aktualnie zarezerwowane przez:</strong>
                                            <p className = "reservation-user">{spot.currentReservation.userName}</p>
                                            <p className = "reseravation-time">
                                                Od: {new Date(spot.currentReservation.startTime).toLocaleString('pl-PL')}
                                                <br />
                                                Do: {new Date(spot.currentReservation.endTime).toLocaleString('pl-PL')}
                                            </p>
                                        </div>
                                    )}

                                    {spot.incomingReservations.length > 0 && (
                                        <div className = "incoming-reservations">
                                            <strong>Nadchodzące rezerwacje:</strong>
                                            <ul>
                                                {spot.incomingReservations.slice(0, 3).map (res => (
                                                    <li key={res.reservationId}>
                                                        <span className="res-user">{res.userName}</span>
                                                        <span className="res-time">
                                                            {new Date(res.startTime).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                            <br />
                                                            {new Date(res.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                            <br />
                                                            {new Date(res.endTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}

                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {spot.incomingReservations.length > 3 && (
                                                <p className="more-reservations">
                                                    + {spot.incomingReservations.length - 3} więcej
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
