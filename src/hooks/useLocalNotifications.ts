import { useState, useEffect, useCallback } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}

export const useLocalNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setNotifications([]);
                setLoading(false);
                return;
            }

            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar notificaciones');
            }

            const data = await response.json();

            const formattedNotifications: Notification[] = data.map((notification: any) => ({
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type as 'info' | 'success' | 'warning' | 'error',
                isRead: notification.is_read === 1,
                createdAt: notification.created_at
            }));

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
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, message, type })
            });

            if (!response.ok) {
                throw new Error('Error al crear notificación');
            }

            // Refresh notifications
            fetchNotifications();
        } catch (err) {
            console.error('Error adding notification:', err);
        }
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al marcar como leída');
            }

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
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar notificación');
            }

            // Update local state immediately
            setNotifications(prev => prev.filter(notif => notif.id !== id));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    }, []);

    const clearAllNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al limpiar notificaciones');
            }

            setNotifications([]);
        } catch (err) {
            console.error('Error clearing notifications:', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
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
