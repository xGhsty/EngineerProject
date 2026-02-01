import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, getParkingSpots, type UserInfo, type ParkingSpot } from '../../api/dashboard';
import './Dashboard.css';

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [user, spots] = await Promise.all([
                getUserInfo(),
                getParkingSpots()
            ]);

            setUserInfo(user);
            setParkingSpots(spots);
            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

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

                <nav className="menu">
                    <button className="menu-item active">🅿️ Moje rezerwacje</button>
                    <button className="menu-item">📋 Ustawienia</button>
                    <button className="menu-item">📜 Historia rezerwacji</button>
                    <button className="menu-item logout" onClick={handleLogout}>Wyloguj się</button>
                </nav>
            </aside>
            
            <main className="main-content">
                <div className="parking-grid">
                    {parkingSpots.map(spot => (
                        <div 
                            key={spot.id}
                            className={`parking-spot ${spot.isAvailable ? 'available' : 'occupied'}`}
                        >
                            <div className="spot-icon">P</div>
                            <div className="spot-name">{spot.name}</div>
                            <div className="spot-status">
                                {spot.isAvailable ? '✓ Wolne' : '✗ Zajęte'}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}