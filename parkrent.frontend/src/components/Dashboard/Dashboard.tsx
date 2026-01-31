import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { getUserInfo, getParkingSpots, type UserInfo, type ParkingSpot } from '../../api/dashboard';
import './Dashboard.css';

export default function Dashboard() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [user, spots]: [any, any]= await Promise.all([
                getUserInfo(),
                getParkingSpots()
            ]);

            setUserInfo(user as UserInfo);
            setParkingSpots(spots as ParkingSpot[]);
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
    }

    if (loading) {
        return <div className='Loading'>Ładowanie...</div>;
    }

    return (
        <div className='Dashboard'>
            <aside className='sidebar'>
                <div className="logo">ParkRent</div>

                <div className="user-info">
                    <div className="avatar">👤</div>
                    <div className="user-details">
                        <p className="greetins">Cześć</p>
                        <p className="username">{userInfo?.fullName}</p>
                    </div>
                </div>

                <nav className="Menu">
                    <button className="menu-item active">
                        Moje miejsce parkingowe
                    </button>
                    <button className ="menu-item">
                        Ustawienia
                    </button>
                    <button className ="menu-item">
                        Historia rezerwacji
                    </button>
                </nav>
                <button className="logout-button" onClick={handleLogout}>
                    Wyloguj się
                    </button>
            </aside>

            <main className="main-content">
                <h1>Panel główny</h1>

                <div className="parking-grid">
                    {parkingSpots.map((spot) => (
                        <div
                            key={spot.id}
                            className={'parking-spot ' + (spot.isAvailable ? 'available' : 'unavailable')}
                        >
                            <div className="spot-icon">P</div>
                            <div className="spot-name">{spot.name}</div>
                            <div className="spot-status">
                                {spot.isAvailable ? 'Wolne' : 'Zajęte'}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}