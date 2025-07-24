
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Footer from '@/components/Footer';
import DashboardOverview from '@/components/admin/DashboardOverview';
import TerminalsManager from '@/components/admin/TerminalsManager';
import ScheduleManager from '@/components/admin/ScheduleManager';
import UsersManager from '@/components/admin/UsersManager';
import BannerManager from '@/components/admin/BannerManager';
import AnalyticsManager from '@/components/admin/AnalyticsManager';
import SeoManager from '@/components/admin/SeoManager';
import MediaManager from '@/components/admin/MediaManager';
import NotificationCenter from '@/components/admin/NotificationCenter';
import PushNotificationManager from '@/components/admin/PushNotificationManager';
import TransportCompaniesManager from '@/components/admin/TransportCompaniesManager';
import SharingConfigManager from '@/components/admin/SharingConfigManager';
import RoutesManager from '@/components/admin/RoutesManager';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [globalSchedules, setGlobalSchedules] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="main-container py-6">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="terminales" element={<TerminalsManager />} />
              <Route path="empresas" element={<TransportCompaniesManager />} />
              <Route path="rutas" element={<RoutesManager />} />
              <Route path="horarios" element={
                <ScheduleManager 
                  schedules={globalSchedules} 
                  onSchedulesChange={setGlobalSchedules} 
                />
              } />
              <Route path="usuarios" element={<UsersManager />} />
              <Route path="banners" element={<BannerManager />} />
              <Route path="analytics" element={<AnalyticsManager />} />
              <Route path="seo" element={<SeoManager />} />
              <Route path="compartir" element={<SharingConfigManager />} />
              <Route path="media" element={<MediaManager />} />
              <Route path="notificaciones" element={
                <NotificationCenter 
                  isOpen={true} 
                  onClose={() => {}} 
                />
              } />
              <Route path="push" element={<PushNotificationManager />} />
            </Routes>
          </div>
        </main>
      </div>
      
      <NotificationCenter 
        isOpen={notificationCenterOpen} 
        onClose={() => setNotificationCenterOpen(false)} 
      />
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
