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
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ReportsHistory = lazy(() => import("./pages/ReportsHistory"));
const Login = lazy(() => import("./pages/Login"));
const PendingApproval = lazy(() => import("./pages/PendingApproval"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const SiteManagement = lazy(() => import("./pages/SiteManagement"));
const AssignmentManagement = lazy(() => import("./pages/AssignmentManagement"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
      
      // Prevent the default behavior (which may crash the app)
      event.preventDefault();
      
      // Show user-friendly toast for common scenarios
      const message = event.reason?.message || String(event.reason);
      if (message.includes('image') || message.includes('photo') || message.includes('compress')) {
        toast.error("Erro ao processar foto", { 
          description: "Tente novamente ou use outra imagem." 
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
                      <Index />
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
                  <Route path="/instalar" element={<Install />} />
                  
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
