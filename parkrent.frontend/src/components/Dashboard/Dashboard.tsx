import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, getParkingSpots, type UserInfo, type ParkingSpot } from '../../api/dashboard';
import './Dashboard.css';

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [noDistrictMessage, setNoDistrictMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [user, parkingSpots] = await Promise.all([
                getUserInfo(),
                getParkingSpots()
            ]);

            setUserInfo(user);

            if (parkingSpots && 'message' in parkingSpots) {
                setParkingSpots([]);
                setNoDistrictMessage(parkingSpots.message);
            }
            else{
                setParkingSpots(parkingSpots);
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
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

                <nav className="menu">
                    {(userRole === "Admin" || userRole === "SuperAdmin") && (
                        <button className="menu-item"><i className='bi bi-people'></i> Panel administracyjny</button>
                    )}
                    <button className="menu-item"><i className='bi bi-p-square'></i>Dostępne miejsca</button>
                    <button className="menu-item"><i className='bi bi-car-front'></i> Moje rezerwacje</button>
                    <button className="menu-item"><i className='bi bi-clock-history'></i> Historia rezerwacji</button>
                    <button className="menu-item"><i className='bi bi-gear'></i> Ustawienia</button>
                    <button className="menu-item logout" onClick={handleLogout}><i className='bi bi-box-arrow-right'></i> Wyloguj się</button>
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