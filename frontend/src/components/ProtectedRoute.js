import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole, isAdmin } from '../auth';

const ProtectedRoute = ({ children, allowedRoles = ['user'] }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  if (!isAuth) {
    // Redirect to login page if not authenticated
    return <Navigate to="/create-user/1" state={{ from: location }} replace />;
  }

  // Admin has access to all pages
  if (isAdmin()) {
    return children;
  }

  // For non-admin users, check if their role is allowed
  if (!allowedRoles.includes(userRole)) {
    // Redirect to home page if role is not allowed
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 