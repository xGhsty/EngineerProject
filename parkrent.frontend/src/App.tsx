import { useCallback, useEffect } from 'react';
import './App.css';
import LoginForm from './components/Login/LoginForm';
import RegisterForm from './components/Register/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import MyParkingSpots from './components/MyParkingSpots/MyParkingSpots';
import MyReservations from './components/MyReservations/MyReservations';
import AdminPanel from './components/AdminPanel/AdminPanel';
import Settings from './components/Settings/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';

const PUBLIC_ROUTES = ['/login', '/register'];

function InactivityWatcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const isProtected = !PUBLIC_ROUTES.includes(location.pathname);

  const handleTimeout = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    }
  }, [navigate]);

  const resetTimer = useInactivityTimeout(handleTimeout, isProtected);

  // Nawigacja między stronami = aktywność, resetuje timer
  useEffect(() => {
    if (isProtected) resetTimer();
  }, [location.pathname, isProtected, resetTimer]);

  return null;
}

function App() {
  return (
    <Router>
      <InactivityWatcher />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-parking-spots"
          element={
            <ProtectedRoute>
              <MyParkingSpots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
