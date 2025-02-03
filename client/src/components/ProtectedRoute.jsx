import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/auth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} />;
  }

  return children;
} 