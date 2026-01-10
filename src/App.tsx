
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import CacheBuster from '@/components/CacheBuster';
import ScriptInjector from "./components/ScriptInjector";
import Index from "./pages/Index";
import Terminal from "./pages/Terminal";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import AllTerminals from "./pages/AllTerminals";
import TransportCompanies from "./pages/TransportCompanies";
import MainRoutes from "./pages/MainRoutes";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Advertising from "./pages/Advertising";
import Register from "./pages/Register";
import DynamicPage from "./pages/DynamicPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { initNotificationPolling } from "./store/useNotificationStore";

// Iniciar polling de notificaciones
initNotificationPolling();

const queryClient = new QueryClient();

const App = () => (
  <GoogleReCaptchaProvider
    reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "INSERT_Site_Key_Here"}
    language="es"
    scriptProps={{
      async: false,
      defer: false,
      appendTo: 'head',
      nonce: undefined,
    }}
  >
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
              <Route path="/publicidad" element={<Advertising />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/*" element={
                <ProtectedRoute requireAdmin={false}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/:slug" element={<DynamicPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstallPrompt />
            <CacheBuster />
            <ScriptInjector />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </GoogleReCaptchaProvider>
);

export default App;
