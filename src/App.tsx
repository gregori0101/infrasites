import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChecklistProvider } from "@/contexts/ChecklistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { toast } from "sonner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";

// Lazy-loaded pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Index = lazy(() => import("./pages/Index"));
const AuditoriaOS = lazy(() => import("./pages/AuditoriaOS"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ReportsHistory = lazy(() => import("./pages/ReportsHistory"));
const Login = lazy(() => import("./pages/Login"));
const PendingApproval = lazy(() => import("./pages/PendingApproval"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const SiteManagement = lazy(() => import("./pages/SiteManagement"));
const AssignmentManagement = lazy(() => import("./pages/AssignmentManagement"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Profile = lazy(() => import("./pages/Profile"));
const ActivityLogs = lazy(() => import("./pages/ActivityLogs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Install = lazy(() => import("./pages/Install"));
const AuditoriaTA = lazy(() => import("./pages/AuditoriaTA"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Fiber Guardian pages
const FGTecnicoDashboard = lazy(() => import("./fiber-guardian/pages/TecnicoDashboard"));
const FGAdminDashboard = lazy(() => import("./fiber-guardian/pages/AdminDashboard"));
const FGNovoRegistro = lazy(() => import("./fiber-guardian/pages/NovoRegistro"));
const FGMeusReparos = lazy(() => import("./fiber-guardian/pages/MeusReparos"));
const FGReparoDetalhes = lazy(() => import("./fiber-guardian/pages/ReparoDetalhes"));
const FGAnalytics = lazy(() => import("./fiber-guardian/pages/Analytics"));
const FGRanking = lazy(() => import("./fiber-guardian/pages/RankingGamificado"));
const FGExportar = lazy(() => import("./fiber-guardian/pages/ExportarExcel"));
const FGMapaReparos = lazy(() => import("./fiber-guardian/pages/MapaReparos"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Global error handlers component
function GlobalErrorHandlers() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[GlobalError] Unhandled Promise Rejection:', event.reason);
      
      // CRITICAL: Prevent the default behavior (which crashes/reloads the app)
      event.preventDefault();
      
      // Show user-friendly toast for common scenarios
      const message = event.reason?.message || String(event.reason);
      
      if (message.includes('image') || message.includes('photo') || message.includes('compress') || message.includes('upload')) {
        toast.error("Erro ao processar foto", { 
          description: "Tente novamente ou use outra imagem." 
        });
      } else if (message.includes('memory') || message.includes('allocation')) {
        toast.error("Memória insuficiente", { 
          description: "Feche outras abas e tente novamente." 
        });
      } else {
        // Generic error for other cases
        toast.error("Ocorreu um erro", { 
          description: "Por favor, tente novamente." 
        });
      }
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('[GlobalError] Uncaught Error:', event.error);
      
      // Don't show toast for every error, only specific ones
      const message = event.message || '';
      if (message.includes('memory') || message.includes('allocation')) {
        toast.error("Memória insuficiente", { 
          description: "Feche outras abas e tente novamente." 
        });
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChecklistProvider>
          <TooltipProvider>
            <GlobalErrorHandlers />
            <Toaster />
            <Sonner position="top-center" />
            <BrowserRouter>
              <PWAInstallPrompt />
              <PWAUpdatePrompt />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/pending-approval" element={<PendingApproval />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />
                  <Route path="/checklist" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria" element={
                    <ProtectedRoute>
                      <AuditoriaOS />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute requireGestor>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/historico" element={
                    <ProtectedRoute>
                      <ReportsHistory />
                    </ProtectedRoute>
                  } />
                  <Route path="/usuarios" element={
                    <ProtectedRoute requireAdmin>
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/sites" element={
                    <ProtectedRoute requireAdmin>
                      <SiteManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/atribuicoes" element={
                    <ProtectedRoute requireGestor>
                      <AssignmentManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/ranking" element={
                    <ProtectedRoute>
                      <Ranking />
                    </ProtectedRoute>
                  } />
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/logs" element={
                    <ProtectedRoute requireAdmin>
                      <ActivityLogs />
                    </ProtectedRoute>
                  } />
                  <Route path="/privacidade" element={<PrivacyPolicy />} />
                  <Route path="/instalar" element={<Install />} />

                  {/* Auditoria TA (Fiber Guardian) routes */}
                  <Route path="/auditoria-ta" element={
                    <ProtectedRoute>
                      <AuditoriaTA />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/tecnico" element={
                    <ProtectedRoute>
                      <FGTecnicoDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/admin" element={
                    <ProtectedRoute requireGestor>
                      <FGAdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/novo-registro" element={
                    <ProtectedRoute>
                      <FGNovoRegistro />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/meus-reparos" element={
                    <ProtectedRoute>
                      <FGMeusReparos />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/reparo/:id" element={
                    <ProtectedRoute>
                      <FGReparoDetalhes />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/analytics" element={
                    <ProtectedRoute>
                      <FGAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/ranking" element={
                    <ProtectedRoute>
                      <FGRanking />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/exportar" element={
                    <ProtectedRoute requireGestor>
                      <FGExportar />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria-ta/mapa" element={
                    <ProtectedRoute>
                      <FGMapaReparos />
                    </ProtectedRoute>
                  } />
                  
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ChecklistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
