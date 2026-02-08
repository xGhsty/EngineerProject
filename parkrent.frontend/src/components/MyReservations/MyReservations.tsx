import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyReservations, getUserInfo, type UserInfo } from "../../api/dashboard";
import { useDarkMode } from "../../hooks/useDarkMode";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import "./MyReservations.css";

interface Reservation {
    id: string;
    parkingSpotName: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

export default function MyReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [data, user] = await Promise.all([
                getMyReservations(),
                getUserInfo()
            ]);
            setReservations(data as Reservation[]);
            setUserInfo(user);
            setLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            setLoading(false);
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
        <div className="my-reservations-container">
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

            <main className="my-reservations-main-content">
                <h1>Moje rezerwacje</h1>

                <div className="reservations-container">
                    {reservations.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <p>Aktualnie brak rezerwacji</p>
                            <p className="empty-hint">
                                Aby dokonać rezerwacji, przejdź do listy dostępnych miejsc parkingowych.
                            </p>
                            <button className="primary-button" onClick={() => navigate("/dashboard")}>
                                Zobacz dostępne miejsca
                            </button>
                        </div>
                    ) : (
                        <div className="reservations-grid">
                            {reservations.map(reservation => (
                                <div key={reservation.id} className={`reservation-card ${reservation.isActive ? 'active' : 'past'}`}>
                                    <div className="reservation-header">
                                        <div className="parking-name">
                                            <i className="bi bi-p-square-fill"></i>
                                            <h3>{reservation.parkingSpotName}</h3>
                                        </div>
                                        <span className={`status-badge ${reservation.isActive ? 'active' : 'past'}`}>
                                            {reservation.isActive ? 'Aktywna' : 'Zakończona'}
                                        </span>
                                    </div>

                                    <div className="reservation-details">
                                        <div className="detail-row">
                                            <i className="bi bi-calendar-check"></i>
                                            <div>
                                                <span className="detail-label">Od:</span>
                                                <span className="detail-value">
                                                    {new Date(reservation.startTime).toLocaleString('pl-PL')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="detail-row">
                                            <i className="bi bi-calendar-x"></i>
                                            <div>
                                                <span className="detail-label">Do:</span>
                                                <span className="detail-value">
                                                    {new Date(reservation.endTime).toLocaleString('pl-PL')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
