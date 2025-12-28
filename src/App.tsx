import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChecklistProvider } from "@/contexts/ChecklistContext";
import Index from "./pages/Index";
import ReportsHistory from "./pages/ReportsHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ChecklistProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/historico" element={<ReportsHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ChecklistProvider>
  </QueryClientProvider>
);

export default App;
