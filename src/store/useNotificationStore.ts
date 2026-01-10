import { create } from 'zustand';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}

interface NotificationStore {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    unreadCount: number;
    addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAllNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,

    fetchNotifications: async () => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al cargar notificaciones');

            const data = await response.json();
            const formattedNotifications: Notification[] = data.map((n: any) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                isRead: n.is_read === 1,
                createdAt: n.created_at
            }));

            // Sync unreadCount with latest data
            set({
                notifications: formattedNotifications,
                unreadCount: formattedNotifications.filter(n => !n.isRead).length,
                loading: false
            });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Error', loading: false });
        }
    },

    addNotification: async (title, message, type = 'info') => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, message, type })
            });
            get().fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    },

    markAsRead: async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Optimistic update
            set((state) => {
                const updatedNotifications = state.notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                return {
                    notifications: updatedNotifications,
                    unreadCount: updatedNotifications.filter(n => !n.isRead).length
                };
            });
        } catch (error) {
            console.error(error);
        }
    },

    deleteNotification: async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Optimistic update
            set((state) => {
                const updatedNotifications = state.notifications.filter(n => n.id !== id);
                return {
                    notifications: updatedNotifications,
                    unreadCount: updatedNotifications.filter(n => !n.isRead).length
                };
            });
        } catch (error) {
            console.error(error);
        }
    },

    clearAllNotifications: async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            set({ notifications: [], unreadCount: 0 });
        } catch (error) {
            console.error(error);
        }
    }
}));

// Setup polling globally (optional, but good for keeping sync)
// Can be called in App.tsx or AdminLayout
export const initNotificationPolling = () => {
    const store = useNotificationStore.getState();
    store.fetchNotifications();

    setInterval(() => {
        useNotificationStore.getState().fetchNotifications();
    }, 15000); // 15 seconds polling
};
