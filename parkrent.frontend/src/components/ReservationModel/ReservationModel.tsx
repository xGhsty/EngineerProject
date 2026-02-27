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
    nextReservationAt?: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

const QUICK_DURATIONS = [
    { label: '30 min', minutes: 30 },
    { label: '1h', minutes: 60 },
    { label: '2h', minutes: 120 },
    { label: '4h', minutes: 240 },
    { label: '8h', minutes: 480 },
];

const DAY_NAMES = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const MONTH_NAMES = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const padMin = (m: string) => String(Math.max(0, Math.min(59, parseInt(m) || 0))).padStart(2, '0');

function toLocalDateStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
    const firstDow = new Date(year, month, 1).getDay();
    const offset = firstDow === 0 ? 6 : firstDow - 1; // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
}

export default function ReservationModal({ parkingSpot, nextReservationAt, onClose, onSuccess }: ReservationModelProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toLocalDateStr(today);

    const [calYear, setCalYear] = useState(today.getFullYear());
    const [calMonth, setCalMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(todayStr);

    const now = new Date();
    const [startHour, setStartHour] = useState(String(now.getHours()).padStart(2, '0'));
    const [startMin, setStartMin] = useState(String(now.getMinutes()).padStart(2, '0'));
    const [endHour, setEndHour] = useState('');
    const [endMin, setEndMin] = useState('00');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canGoPrev = !(calMonth === today.getMonth() && calYear === today.getFullYear());

    const prevMonth = () => {
        if (!canGoPrev) return;
        if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
        else setCalMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
        else setCalMonth(m => m + 1);
    };

    const isPast = (day: number) => new Date(calYear, calMonth, day) < today;
    const isTodayDay = (day: number) => toLocalDateStr(new Date(calYear, calMonth, day)) === todayStr;
    const isSelected = (day: number) => toLocalDateStr(new Date(calYear, calMonth, day)) === selectedDate;

    const selectDay = (day: number) => {
        if (isPast(day)) return;
        setSelectedDate(toLocalDateStr(new Date(calYear, calMonth, day)));
    };

    const applyDuration = (minutes: number) => {
        if (!startHour) return;
        const totalMins = parseInt(startHour) * 60 + (parseInt(startMin) || 0) + minutes;
        const newH = Math.floor(totalMins / 60) % 24;
        const newM = totalMins % 60;
        setEndHour(String(newH).padStart(2, '0'));
        setEndMin(String(newM));
    };

    const getDurationText = (): string | null => {
        if (!startHour || !endHour) return null;
        const start = new Date(`${selectedDate}T${startHour}:${padMin(startMin)}:00`);
        const end = new Date(`${selectedDate}T${endHour}:${padMin(endMin)}:00`);
        if (end <= start) end.setDate(end.getDate() + 1);
        const diffMins = Math.round((end.getTime() - start.getTime()) / 60000);
        if (diffMins <= 0) return null;
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        if (h === 0) return `${m} min`;
        if (m === 0) return `${h} godz`;
        return `${h} godz ${m} min`;
    };

    const formatDateLong = (d: Date) =>
        d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });

    const getFormattedDate = () => formatDateLong(new Date(`${selectedDate}T12:00:00`));

    const spansNextDay = (): boolean => {
        if (!startHour || !endHour) return false;
        const start = new Date(`${selectedDate}T${startHour}:${padMin(startMin)}:00`);
        const end = new Date(`${selectedDate}T${endHour}:${padMin(endMin)}:00`);
        return end <= start;
    };

    const getFormattedEndDate = (): string => {
        const endDt = new Date(`${selectedDate}T${endHour}:${padMin(endMin)}:00`);
        const startDt = new Date(`${selectedDate}T${startHour}:${padMin(startMin)}:00`);
        if (endDt <= startDt) endDt.setDate(endDt.getDate() + 1);
        return formatDateLong(endDt);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!startHour || !endHour) {
            setError('Wybierz godzinę rozpoczęcia i zakończenia.');
            return;
        }

        const startDt = new Date(`${selectedDate}T${startHour}:${padMin(startMin)}:00`);
        const endDtSame = new Date(`${selectedDate}T${endHour}:${padMin(endMin)}:00`);
        const endDt = endDtSame <= startDt
            ? new Date(endDtSame.getTime() + 86400000)
            : endDtSame;

        const nowFloor = new Date();
        nowFloor.setSeconds(0, 0);
        if (startDt < nowFloor) {
            setError('Nie można dokonać rezerwacji w przeszłości.');
            return;
        }

        setLoading(true);
        try {
            await createReservation({
                parkingSpotId: parkingSpot.id,
                startTime: startDt.toISOString(),
                endTime: endDt.toISOString()
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas tworzenia rezerwacji');
            setLoading(false);
        }
    };

    const calDays = getCalendarDays(calYear, calMonth);
    const durationText = getDurationText();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" type="button" onClick={onClose}>
                    <i className="bi bi-x-lg"></i>
                </button>

                <div className="reservation-header">
                    <div className="spot-icon-large">P</div>
                    <div>
                        <h2>{parkingSpot.name}</h2>
                        <span className="reservation-subtitle">Rezerwacja miejsca parkingowego</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="reservation-form">
                    {parkingSpot.availableFrom && parkingSpot.availableTo && (
                        <div className="availability-notice">
                            <i className="bi bi-clock-fill"></i>
                            <div>
                                Dostępne tylko w godzinach{' '}
                                <strong>{parkingSpot.availableFrom} – {parkingSpot.availableTo}</strong>
                            </div>
                        </div>
                    )}
                    {nextReservationAt && (
                        <div className="availability-notice next-reservation-notice">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <div>
                                Miejsce będzie zajęte od{' '}
                                <strong>{new Date(nextReservationAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</strong>
                                {' '}— rezerwacja nie może przekraczać tej godziny
                            </div>
                        </div>
                    )}

                    <div className="calendar">
                        <div className="calendar-nav">
                            <button
                                type="button"
                                className="cal-nav-btn"
                                onClick={prevMonth}
                                disabled={!canGoPrev}
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                            <span className="cal-month-label">
                                {MONTH_NAMES[calMonth]} {calYear}
                            </span>
                            <button type="button" className="cal-nav-btn" onClick={nextMonth}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>

                        <div className="calendar-grid">
                            {DAY_NAMES.map(d => (
                                <div key={d} className="cal-day-name">{d}</div>
                            ))}
                            {calDays.map((day, idx) => (
                                <div key={idx} className="cal-cell">
                                    {day !== null && (
                                        <button
                                            type="button"
                                            className={[
                                                'cal-day',
                                                isSelected(day) ? 'selected' : '',
                                                isTodayDay(day) && !isSelected(day) ? 'today' : '',
                                                isPast(day) ? 'past' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => selectDay(day)}
                                            disabled={isPast(day)}
                                        >
                                            {day}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="time-row">
                        <div className="time-input-group">
                            <label>Od</label>
                            <div className="time-selects">
                                <select
                                    value={startHour}
                                    onChange={(e) => setStartHour(e.target.value)}
                                    className="time-select"
                                    required
                                >
                                    <option value="">--</option>
                                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <span className="time-colon">:</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={startMin}
                                    onChange={(e) => setStartMin(e.target.value)}
                                    className="min-input"
                                    placeholder="00"
                                />
                            </div>
                        </div>

                        <div className="time-divider">
                            <i className="bi bi-arrow-right"></i>
                        </div>

                        <div className="time-input-group">
                            <label>Do</label>
                            <div className="time-selects">
                                <select
                                    value={endHour}
                                    onChange={(e) => setEndHour(e.target.value)}
                                    className="time-select"
                                    required
                                >
                                    <option value="">--</option>
                                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                <span className="time-colon">:</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={endMin}
                                    onChange={(e) => setEndMin(e.target.value)}
                                    className="min-input"
                                    placeholder="00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="quick-duration">
                        <span className="quick-label">Szybki wybór czasu trwania:</span>
                        <div className="duration-buttons">
                            {QUICK_DURATIONS.map(({ label, minutes }) => (
                                <button
                                    key={label}
                                    type="button"
                                    className="duration-btn"
                                    onClick={() => applyDuration(minutes)}
                                    disabled={!startHour}
                                    title={!startHour ? 'Najpierw wybierz godzinę "Od"' : undefined}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {durationText && (
                        <div className="reservation-summary">
                            <i className="bi bi-check-circle-fill"></i>
                            <div className="summary-details">
                                <span className="summary-date">
                                    {spansNextDay()
                                        ? `${getFormattedDate()} → ${getFormattedEndDate()}`
                                        : getFormattedDate()
                                    }
                                </span>
                                <span className="summary-time">
                                    {startHour}:{padMin(startMin)} – {endHour}:{padMin(endMin)}
                                </span>
                                <span className="summary-duration">Czas trwania: {durationText}</span>
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Anuluj
                        </button>
                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading
                                ? <><i className="bi bi-hourglass-split"></i> Tworzenie...</>
                                : <><i className="bi bi-check-lg"></i> Zarezerwuj</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
