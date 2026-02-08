import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, getParkingSpots, getParkingSpotsByDistrict, getDistricts, type UserInfo, type ParkingSpot, type District } from '../../api/dashboard';
import { useDarkMode } from '../../hooks/useDarkMode';
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle';
import ReservationModal from '../ReservationModel/ReservationModel';
import './Dashboard.css';

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [noDistrictMessage, setNoDistrictMessage] = useState<string | null>(null);
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [user, spotsResponse] = await Promise.all([
                getUserInfo(),
                getParkingSpots()
            ]);

            setUserInfo(user);

            if (spotsResponse && 'message' in spotsResponse) {
                setParkingSpots([]);
                setNoDistrictMessage(spotsResponse.message);
                const districtsData = await getDistricts();
                setDistricts(districtsData);
            } else {
                setParkingSpots(spotsResponse);
                setNoDistrictMessage(null);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        }
    };

    const handleDistrictChange = async (districtId: string) => {
        setSelectedDistrict(districtId);
        if (districtId) {
            try {
                const spots = await getParkingSpotsByDistrict(districtId);
                setParkingSpots(spots);
            } catch (error) {
                console.error('Error loading parking spots for district:', error);
                setParkingSpots([]);
            }
        } else {
            setParkingSpots([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const handleSpotClick = (spot: ParkingSpot) => {
        if (spot.isAvailable) {
            setSelectedSpot(spot);
        }
    };

    const handleReservationSuccess = () => {
        loadDashboardData();
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

            <main className="main-content">
                {noDistrictMessage && (
                    <div className="district-selector-container">
                        <div className="info-banner">
                            <p>ℹ️ {noDistrictMessage}</p>
                        </div>
                        <div className="district-selector">
                            <label htmlFor="district-select">Wybierz dzielnicę, aby zobaczyć dostępne miejsca:</label>
                            <select
                                id="district-select"
                                value={selectedDistrict}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                className="district-select"
                            >
                                <option value="">-- Wybierz dzielnicę --</option>
                                {districts.map(district => (
                                    <option key={district.id} value={district.id}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="parking-grid">
                    {parkingSpots.length === 0 && !noDistrictMessage ? (
                        <div className="empty-state">
                            <p>Brak dostępnych miejsc parkingowych</p>
                        </div>
                    ) : noDistrictMessage && !selectedDistrict ? null : parkingSpots.length === 0 ? (
                        <div className="empty-state">
                            <p>Brak dostępnych miejsc parkingowych w wybranej dzielnicy</p>
                        </div>
                    ) : (
                        parkingSpots.map(spot => (
                            <div
                                key={spot.id}
                                className={`parking-spot ${spot.isAvailable ? 'available' : 'occupied'} ${spot.isAvailable ? 'clickable' : ''}`}
                                onClick={() => handleSpotClick(spot)}
                            >
                                <div className="spot-icon">P</div>
                                <div className="spot-name">{spot.name}</div>
                                {spot.availableFrom && spot.availableTo && spot.isAvailable && (
                                    <div className="spot-hours">
                                        <i className="bi bi-clock"></i>
                                        <div className="hours-info">
                                            <span className="hours-label">Dostępne tylko:</span>
                                            <span className="hours-value">{spot.availableFrom} - {spot.availableTo}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="spot-status">
                                    {spot.isAvailable ? '✓ Wolne' : '✗ Zajęte'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {selectedSpot && (
                <ReservationModal
                    parkingSpot={selectedSpot}
                    onClose={() => setSelectedSpot(null)}
                    onSuccess={handleReservationSuccess}
                />
            )}
        </div>
    );
}
