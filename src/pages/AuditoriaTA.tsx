import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useFGAuth } from "@/fiber-guardian/hooks/useFGAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, FileText, BarChart3, Trophy, Download, Loader2 } from "lucide-react";
import { VivoLogo } from "@/components/ui/vivo-logo";

export default function AuditoriaTA() {
  const navigate = useNavigate();
  const { profile, isAdmin, loading } = useFGAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to role-specific dashboard
  if (isAdmin) {
    navigate("/auditoria-ta/admin", { replace: true });
    return null;
  }

  navigate("/auditoria-ta/tecnico", { replace: true });
  return null;
}
