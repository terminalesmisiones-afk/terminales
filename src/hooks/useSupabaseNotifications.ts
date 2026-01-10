import { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export const useSupabaseNotifications = () => {
  const [notifications] = useState<Notification[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Disabled Supabase realtime to prevent WebSocket errors
  // Using local SQLite database instead

  const addNotification = async () => {
    console.log('Notifications disabled - using local database');
  };

  const markAsRead = async () => {
    console.log('Notifications disabled - using local database');
  };

  const deleteNotification = async () => {
    console.log('Notifications disabled - using local database');
  };

  const clearAllNotifications = async () => {
    console.log('Notifications disabled - using local database');
  };

  const fetchNotifications = async () => {
    console.log('Notifications disabled - using local database');
  };

  const unreadCount = 0;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    addNotification,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications: fetchNotifications
  };
};