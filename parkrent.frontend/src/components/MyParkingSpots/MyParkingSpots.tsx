import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyParkingSpots, toggleParkingSpotAvailability, MyParkingSpot } from "../../api/userParking";
import "./MyParkingSpots.css";

export default function MyParkingSpots() {
    const [mySpots, setMySpots] = useState<MyParkingSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadMySpots();
    }, []);

    const loadMySpots = async () => {
        try {
            const spots = await getMyParkingSpots();
            setMySpots(spots);
            setLoading(false);
        } catch (error) {
            console.error('Error loading my parking spots:', error);
            setLoading(false);
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

    if (loading){
        return <div className="loading">Ładowanie...</div>
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="back-button" onClick={() => navigate("/dashboard")}>Powrót</button>
                <h1>Moje miejsca parkingowe</h1>
            </div>
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
                                    <button 
                                        className={`toggle-button ${spot.isAvailable ? "available" : "unavailable"}`}
                                        onClick={() => handleToggleAvailability(spot.id)}
                                        disabled={!!spot.currentReservation}
                                    >
                                        {spot.isAvailable ? "Udostępnij miejsce" : "Zablokuj miejsce"}
                                    </button>
                                    {spot.currentReservation && (
                                        <p className="toggle-info">
                                            Nie mozna zablokowac miejsca w trakcie aktywnej rezerwacji
                                        </p>
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
        </div>
    ); 
}