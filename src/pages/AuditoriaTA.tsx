import { Navigate } from "react-router-dom";
import { useFGAuth } from "@/fiber-guardian/hooks/useFGAuth";
import { Loader2 } from "lucide-react";

export default function AuditoriaTA() {
  const { isAdmin, loading } = useFGAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/auditoria-ta/admin" replace />;
  }

  return <Navigate to="/auditoria-ta/tecnico" replace />;
}
