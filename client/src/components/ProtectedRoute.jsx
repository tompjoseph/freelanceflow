import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="FreelanceFlow" className="h-12 w-auto animate-pulse" />
          <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
