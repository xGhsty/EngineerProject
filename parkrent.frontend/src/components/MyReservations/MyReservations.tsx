import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyReservations, cancelReservation, getUserInfo, type UserInfo } from "../../api/dashboard";
import { useDarkMode } from "../../hooks/useDarkMode";
import DarkModeToggle from "../DarkModeToggle/DarkModeToggle";
import "./MyReservations.css";

interface Reservation {
    id: string;
    parkingSpotName: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    isCancelled?: boolean;
}

export default function MyReservations() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'active' | 'history'>('active');
    const [historyPage, setHistoryPage] = useState(1);
    const ITEMS_PER_PAGE = 20;
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
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

    const handleCancelConfirm = async () => {
        if (!confirmId) return;
        try {
            await cancelReservation(confirmId);
            setConfirmId(null);
            setCancelError(null);
            await loadData();
        } catch (error: unknown) {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Nie udało się anulować rezerwacji.';
            setCancelError(msg);
        }
    };

    const getPageItems = (current: number, total: number): (number | '...')[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const items: (number | '...')[] = [1];
        if (current > 3) items.push('...');
        for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
            items.push(p);
        }
        if (current < total - 2) items.push('...');
        items.push(total);
        return items;
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

            <main className="my-reservations-main-content">
                <h1>Moje rezerwacje</h1>

                <div className="reservations-filter-tabs">
                    <button
                        className={`filter-tab ${activeFilter === 'active' ? 'active' : ''}`}
                        onClick={() => { setActiveFilter('active'); setHistoryPage(1); }}
                    >
                        <i className="bi bi-clock"></i> Aktywne
                        {reservations.filter(r => r.isActive).length > 0 && (
                            <span className="filter-count">{reservations.filter(r => r.isActive).length}</span>
                        )}
                    </button>
                    <button
                        className={`filter-tab ${activeFilter === 'history' ? 'active' : ''}`}
                        onClick={() => { setActiveFilter('history'); setHistoryPage(1); }}
                    >
                        <i className="bi bi-clock-history"></i> Historia
                        {reservations.filter(r => !r.isActive).length > 0 && (
                            <span className="filter-count">{reservations.filter(r => !r.isActive).length}</span>
                        )}
                    </button>
                </div>

                {activeFilter === 'history' && (
                    <div className="history-retention-info">
                        <i className="bi bi-info-circle"></i>
                        Historia rezerwacji jest przechowywana przez 30 dni.
                    </div>
                )}

                <div className="reservations-container">
                    {(() => {
                        const filtered = reservations.filter(r => activeFilter === 'active' ? r.isActive : !r.isActive);
                        const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                        const paginated = activeFilter === 'history'
                            ? filtered.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE)
                            : filtered;

                        if (reservations.length === 0) return (
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
                        );

                        if (filtered.length === 0) return (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <i className={activeFilter === 'active' ? 'bi bi-clock' : 'bi bi-clock-history'}></i>
                                </div>
                                <p>{activeFilter === 'active' ? 'Brak aktywnych rezerwacji' : 'Brak zakończonych rezerwacji'}</p>
                            </div>
                        );

                        return (
                            <>
                                <div className="reservations-grid">
                                    {paginated.map(reservation => (
                                        <div key={reservation.id} className={`reservation-card ${reservation.isActive ? 'active' : reservation.isCancelled ? 'cancelled' : 'past'}`}>
                                            <div className="reservation-header">
                                                <div className="parking-name">
                                                    <i className="bi bi-p-square-fill"></i>
                                                    <h3>{reservation.parkingSpotName}</h3>
                                                </div>
                                                <span className={`status-badge ${reservation.isActive ? 'active' : reservation.isCancelled ? 'cancelled' : 'past'}`}>
                                                    {reservation.isActive ? 'Aktywna' : reservation.isCancelled ? 'Anulowana' : 'Zakończona'}
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
                                            {reservation.isActive && (
                                                <button
                                                    className="cancel-reservation-btn"
                                                    onClick={() => { setCancelError(null); setConfirmId(reservation.id); }}
                                                >
                                                    <i className="bi bi-x-circle"></i> Anuluj rezerwację
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {activeFilter === 'history' && totalPages > 1 && (
                                    <div className="pagination-bar">
                                        <button
                                            className="page-btn"
                                            onClick={() => setHistoryPage(1)}
                                            disabled={historyPage === 1}
                                        >
                                            <i className="bi bi-chevron-double-left"></i>
                                        </button>
                                        <button
                                            className="page-btn"
                                            onClick={() => setHistoryPage(p => p - 1)}
                                            disabled={historyPage === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                        {getPageItems(historyPage, totalPages).map((item, idx) =>
                                            item === '...'
                                                ? <span key={`e${idx}`} className="page-ellipsis">…</span>
                                                : <button
                                                    key={item}
                                                    className={`page-btn ${historyPage === item ? 'active' : ''}`}
                                                    onClick={() => setHistoryPage(item as number)}
                                                >{item}</button>
                                        )}
                                        <button
                                            className="page-btn"
                                            onClick={() => setHistoryPage(p => p + 1)}
                                            disabled={historyPage === totalPages}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                        <button
                                            className="page-btn"
                                            onClick={() => setHistoryPage(totalPages)}
                                            disabled={historyPage === totalPages}
                                        >
                                            <i className="bi bi-chevron-double-right"></i>
                                        </button>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </main>

            {confirmId && (
                <div className="confirm-overlay" onClick={() => setConfirmId(null)}>
                    <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <h3>Anulować rezerwację?</h3>
                        <p>Czy na pewno chcesz anulować tę rezerwację? Operacji nie można cofnąć.</p>
                        {cancelError && (
                            <p className="confirm-error">{cancelError}</p>
                        )}
                        <div className="confirm-actions">
                            <button className="confirm-btn-cancel" onClick={() => setConfirmId(null)}>
                                Nie, wróć
                            </button>
                            <button className="confirm-btn-confirm" onClick={handleCancelConfirm}>
                                <i className="bi bi-x-circle"></i> Tak, anuluj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
