import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, getParkingSpots, getParkingSpotsByDistrict, getDistricts, type UserInfo, type ParkingSpot, type District } from '../../api/dashboard';
import { useDarkMode } from '../../hooks/useDarkMode';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';
import ReservationModal from '../ReservationModel/ReservationModel';
import './Dashboard.css';

interface Notification {
    id: number;
    spotName: string;
    type: 'freed' | 'occupied';
    time: Date;
}

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [noDistrictMessage, setNoDistrictMessage] = useState<string | null>(null);
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const prevSpotsRef = useRef<Record<string, boolean>>({});
    const notifIdRef = useRef(0);
    const selectedDistrictRef = useRef('');
    const noDistrictRef = useRef(false);
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    const applySpots = (spots: ParkingSpot[]) => {
        const prev = prevSpotsRef.current;
        const newNotifs: Notification[] = [];

        spots.forEach(spot => {
            if (spot.id in prev && prev[spot.id] !== spot.isAvailable) {
                newNotifs.push({
                    id: ++notifIdRef.current,
                    spotName: spot.name,
                    type: spot.isAvailable ? 'freed' : 'occupied',
                    time: new Date(),
                });
            }
            prev[spot.id] = spot.isAvailable;
        });

        if (newNotifs.length > 0) {
            setNotifications(n => [...newNotifs, ...n].slice(0, 20));
        }

        setParkingSpots(spots);
    };

    const loadDashboardData = async () => {
        try {
            const [user, spotsResponse, districtsData] = await Promise.all([
                getUserInfo(),
                getParkingSpots(),
                getDistricts()
            ]);

            setUserInfo(user);
            setDistricts(districtsData);

            if (spotsResponse && 'message' in spotsResponse) {
                setParkingSpots([]);
                setNoDistrictMessage(spotsResponse.message);
                noDistrictRef.current = true;
            } else {
                applySpots(spotsResponse as ParkingSpot[]);
                setNoDistrictMessage(null);
                noDistrictRef.current = false;
                // Pre-select user's own district
                if (user.districtId) {
                    setSelectedDistrict(user.districtId);
                    selectedDistrictRef.current = user.districtId;
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        }
    };

    const refreshSpots = async () => {
        try {
            const districtId = selectedDistrictRef.current;
            if (districtId) {
                const spots = await getParkingSpotsByDistrict(districtId);
                applySpots(spots);
            } else if (!noDistrictRef.current) {
                const spotsResponse = await getParkingSpots();
                if (!('message' in spotsResponse)) {
                    applySpots(spotsResponse as ParkingSpot[]);
                }
            }
        } catch (error) {
            console.error('Błąd podczas odświeżania miejsc parkingowych:', error);
        }
    };

    useEffect(() => {
        loadDashboardData();

        const interval = setInterval(() => {
            refreshSpots();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleDistrictChange = async (districtId: string) => {
        setSelectedDistrict(districtId);
        selectedDistrictRef.current = districtId;
        if (districtId) {
            try {
                const spots = await getParkingSpotsByDistrict(districtId);
                applySpots(spots);
            } catch (error) {
                console.error('Error loading parking spots for district:', error);
                setParkingSpots([]);
            }
        } else if (noDistrictRef.current) {
            setParkingSpots([]);
        } else {
            const spotsResponse = await getParkingSpots();
            if (!('message' in spotsResponse)) {
                applySpots(spotsResponse as ParkingSpot[]);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleSpotClick = (spot: ParkingSpot) => {
        if (spot.isAvailable && !spot.isOutsideHours) {
            setSelectedSpot(spot);
        }
    };

    const formatReservedUntil = (isoDate: string) => {
        const d = new Date(isoDate);
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        if (isToday) {
            return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
            + ' ' + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };

    const handleReservationSuccess = () => {
        if (selectedSpot) {
            setParkingSpots(prev => prev.map(s =>
                s.id === selectedSpot.id ? { ...s, isAvailable: false } : s
            ));
        }
        refreshSpots();
    };

    const userRole = localStorage.getItem('role');

    if (loading) {
        return <div className='loading'>Ładowanie...</div>;
    }

    return (
        <div className="dashboard">
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

            <main className="main-content">
                <div className="notifications-bar">
                    <button
                        className="notif-bell-btn"
                        onClick={() => setNotifOpen(o => !o)}
                    >
                        <i className="bi bi-bell"></i>
                        <span className="notif-title">Powiadomienia</span>
                        {notifications.length > 0 && (
                            <span className="notif-badge">{notifications.length}</span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="notif-dropdown">
                            {notifications.length === 0 ? (
                                <div className="notif-empty">Brak powiadomień</div>
                            ) : (
                                <>
                                    <div className="notif-list">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`notif-item ${n.type}`}>
                                                <span className="notif-icon">
                                                    {n.type === 'freed' ? '✓' : '✗'}
                                                </span>
                                                <div className="notif-content">
                                                    <span className="notif-spot">{n.spotName}</span>
                                                    <span className="notif-msg">
                                                        {n.type === 'freed' ? 'Zwolnione' : 'Zajęte'}
                                                    </span>
                                                </div>
                                                <span className="notif-time">
                                                    {n.time.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="notif-clear"
                                        onClick={() => setNotifications([])}
                                    >
                                        Wyczyść wszystkie
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="district-selector-container">
                    {noDistrictMessage && (
                        <div className="info-banner">
                            <p>ℹ️ {noDistrictMessage}</p>
                        </div>
                    )}
                    <div className="district-selector">
                        <label htmlFor="district-select">
                            {noDistrictMessage
                                ? 'Wybierz dzielnicę, aby zobaczyć dostępne miejsca:'
                                : 'Przeglądasz dzielnicę:'}
                        </label>
                        <select
                            id="district-select"
                            value={selectedDistrict}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="district-select"
                        >
                            {noDistrictMessage
                                ? <option value="">-- Wybierz dzielnicę --</option>
                                : <option value="">-- Twoja dzielnica --</option>
                            }
                            {districts.map(district => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                    {district.id === userInfo?.districtId ? ' (Twoja)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="parking-grid">
                    {noDistrictMessage && !selectedDistrict ? null : parkingSpots.length === 0 ? (
                        <div className="empty-state">
                            <p>Brak dostępnych miejsc parkingowych w wybranej dzielnicy</p>
                        </div>
                    ) : (
                        parkingSpots.map(spot => (
                            <div
                                key={spot.id}
                                className={`parking-spot ${spot.isAvailable ? 'available' : spot.reservedUntil ? 'occupied' : 'outside-hours'} ${spot.isAvailable ? 'clickable' : ''}`}
                                onClick={() => handleSpotClick(spot)}
                            >
                                <div className="spot-icon">P</div>
                                <div className="spot-name">{spot.name}</div>
                                {spot.availableFrom && spot.availableTo && (
                                    <div className="spot-hours">
                                        <i className="bi bi-clock"></i>
                                        <div className="hours-info">
                                            <span className="hours-label">Dostępne tylko:</span>
                                            <span className="hours-value">{spot.availableFrom} - {spot.availableTo}</span>
                                        </div>
                                    </div>
                                )}
                                {spot.isAvailable && spot.nextReservationAt && (
                                    <div className="spot-next-reservation">
                                        <i className="bi bi-clock-history"></i>
                                        Od {formatReservedUntil(spot.nextReservationAt)} zajęte
                                    </div>
                                )}
                                <div className="spot-status">
                                    {spot.isAvailable
                                        ? '✓ Wolne'
                                        : spot.isOutsideHours
                                            ? '⊘ Niedostępny'
                                            : spot.reservedUntil
                                                ? `✗ Zajęte do ${formatReservedUntil(spot.reservedUntil)}`
                                                : '⊘ Niedostępny'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {selectedSpot && (
                <ReservationModal
                    parkingSpot={selectedSpot}
                    nextReservationAt={selectedSpot.nextReservationAt ?? null}
                    onClose={() => setSelectedSpot(null)}
                    onSuccess={handleReservationSuccess}
                />
            )}
        </div>
    );
}
