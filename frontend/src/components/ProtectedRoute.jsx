import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // ZMIANA: Zamiast /login, kierujemy na /forbidden
    return <Navigate to="/forbidden" replace />;
  }

  // Użytkownik jest zalogowany - pozwól na wyświetlenie komponentu
  return <Outlet />;
}

export default ProtectedRoute;
