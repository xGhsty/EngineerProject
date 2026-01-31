import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  
  console.log("=== ProtectedRoute ===");
  console.log("Token from localStorage:", token);
  console.log("Token exists?", !!token);
  console.log("Token length:", token?.length);
  
  if (!token) {
    console.log("❌ No token - redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("✅ Token found - rendering dashboard");
  return <>{children}</>;
}