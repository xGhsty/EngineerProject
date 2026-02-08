import { useState } from 'react';
import { createReservation } from '../../api/reservation';
import './ReservationModel.css';

interface ReservationModelProps {
    parkingSpot: {
        id: string;
        name: string;
        availableFrom?: string | null;
        availableTo?: string | null;
    };
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReservationModal({ parkingSpot, onClose, onSuccess }: ReservationModelProps) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Ustaw minimalną datę na obecny czas
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createReservation({
                parkingSpotId: parkingSpot.id,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString()
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas tworzenia rezerwacji');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <i className="bi bi-x-lg"></i>
                </button>

                <h2>Rezerwacja miejsca parkingowego</h2>
                <div className="parking-spot-info">
                    <h3>{parkingSpot.name}</h3>
                    {parkingSpot.availableFrom && parkingSpot.availableTo && (
                        <div className="availability-notice">
                            <i className="bi bi-info-circle"></i>
                            <div>
                                <strong>Uwaga:</strong> To miejsce jest dostępne tylko w godzinach <strong>{parkingSpot.availableFrom} - {parkingSpot.availableTo}</strong>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="reservation-form">
                    <div className="form-group">
                        <label htmlFor="startTime">Data i godzina rozpoczęcia:</label>
                        <input
                            type="datetime-local"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            min={getMinDateTime()}
                            required
                            className="datetime-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="endTime">Data i godzina zakończenia:</label>
                        <input
                            type="datetime-local"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            min={startTime || getMinDateTime()}
                            required
                            className="datetime-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Anuluj
                        </button>
                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? 'Tworzenie...' : 'Zarezerwuj'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
