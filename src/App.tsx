
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from "@/components/ui/toaster";
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import Index from "./pages/Index";
import Terminal from "./pages/Terminal";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import AllTerminals from "./pages/AllTerminals";
import TransportCompanies from "./pages/TransportCompanies";
import MainRoutes from "./pages/MainRoutes";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HotToaster />
      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/terminal/:id" element={<Terminal />} />
            <Route path="/terminales" element={<AllTerminals />} />
            <Route path="/empresas" element={<TransportCompanies />} />
            <Route path="/rutas" element={<MainRoutes />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/ayuda" element={<HelpCenter />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PWAInstallPrompt />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
