import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Оборачивай приватные страницы:
 * <RequireAuth><AuthorDashboard/></RequireAuth>
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, booted } = useAuth();
  const location = useLocation();

  if (!booted) return null; // можно отрендерить спиннер

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
