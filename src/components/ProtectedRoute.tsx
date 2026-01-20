import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireGestor?: boolean;
}

export default function ProtectedRoute({ children, requireGestor = false }: ProtectedRouteProps) {
  const { user, isLoading, isApproved, isGestor } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not approved
  if (!isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Requires gestor but user is not gestor
  if (requireGestor && !isGestor) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
