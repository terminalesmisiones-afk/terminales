import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export const useSupabaseNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedNotifications: Notification[] = data?.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type as 'info' | 'success' | 'warning' | 'error',
        isRead: notification.is_read,
        createdAt: notification.created_at
      })) || [];

      setNotifications(formattedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const addNotification = useCallback(async (
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{ title, message, type }]);

      if (error) throw error;

      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error('Error adding notification:', err);
    }
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        () => {
          console.log('Notifications changed, refreshing...');
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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