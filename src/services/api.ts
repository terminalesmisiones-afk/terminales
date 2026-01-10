// Usamos ruta relativa porque el Proxy de Vite (en dev) o Nginx (en prod) maneja la redirección
const API_URL = 'https://api-terminales.onrender.com/api';

console.log('API Service initialized with URL:', API_URL);


export const api = {
    // Terminals
    getTerminals: async () => {
        const response = await fetch(`${API_URL}/terminals?_t=${new Date().getTime()}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },

    // Admin Terminals (with role-based filtering)
    getAdminTerminals: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/terminals?_t=${new Date().getTime()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch admin terminals');
        return response.json();
    },

    getTerminalById: async (id: string) => {
        const response = await fetch(`${API_URL}/terminals/${id}?_t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error('Terminal not found');
        }
        return response.json();
    },

    createTerminal: async (terminalData: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/terminals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(terminalData)
        });
        if (!response.ok) throw new Error('Failed to create terminal');
        return response.json();
    },

    updateTerminal: async (id: string, terminalData: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/terminals/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(terminalData)
        });
        if (!response.ok) throw new Error('Failed to update terminal');
        return response.json();
    },

    deleteTerminal: async (id: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/terminals/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete terminal');
        return response.json();
    },

    // Auth
    login: async (email, password, captchaToken?) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, captchaToken })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        return response.json();
    },

    // Upload
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }
        return response.json();
    },

    // Sync
    syncTerminals: async (csvUrl: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/sync/terminals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ csvUrl })
        });
        if (!response.ok) throw new Error('Failed to sync terminals');
        return response.json();
    },

    syncTerminalById: async (id: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/terminals/${id}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to sync terminal');
        }
        return response.json();
    },

    // Companies API
    getCompanies: async () => {
        const response = await fetch(`${API_URL}/companies?_t=${new Date().getTime()}`);
        return response.json();
    },

    getAdminCompanies: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/companies?_t=${new Date().getTime()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch admin companies');
        return response.json();
    },

    createCompany: async (data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create company');
        return response.json();
    },

    updateCompany: async (id: number | string, data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/companies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update company');
        return response.json();
    },

    deleteCompany: async (id: number | string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/companies/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete company');
        return response.json();
    },

    // Banners API
    getBanners: async () => {
        const response = await fetch(`${API_URL}/banners?_t=${new Date().getTime()}`);
        return response.json();
    },

    getAdminBanners: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/banners?_t=${new Date().getTime()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },

    createBanner: async (data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/banners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create banner');
        return response.json();
    },

    updateBanner: async (id: number | string, data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/banners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update banner');
        return response.json();
    },

    deleteBanner: async (id: number | string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/banners/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete banner');
        return response.json();
    },

    // Users API
    getUsers: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users?_t=${new Date().getTime()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    createUser: async (data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create user');
        }
        return response.json();
    },

    updateUser: async (id: number | string, data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update user');
        }
        return response.json();
    },

    updateUserPassword: async (id: number | string, newPassword: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users/${id}/password`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ newPassword })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update password');
        }
        return response.json();
    },

    deleteUser: async (id: number | string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    },

    getPendingRegistrations: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/registrations?t=${new Date().getTime()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch pending registrations');
        return response.json();
    },

    approveRegistration: async (id: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/registrations/${id}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to approve registration');
        return response.json();
    },

    rejectRegistration: async (id: string, reason: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/registrations/${id}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        if (!response.ok) throw new Error('Failed to reject registration');
        return response.json();
    },

    getDashboardStats: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        return response.json();
    },

    getSettings: async (key: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/settings/${key}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },

    saveSettings: async (key: string, data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/settings/${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to save settings');
        return response.json();
    },
    // Analytics
    logSearch: async (query: string, category?: string) => {
        const response = await fetch(`${API_URL}/analytics/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, category }),
        });
        if (!response.ok) throw new Error('Failed to log search');
        return response.json();
    },

    getSearchStats: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/analytics/search-stats`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch search stats');
        return response.json();
    },

    // Pages (CMS)
    getPages: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/pages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch pages');
        return response.json();
    },

    getPageBySlug: async (slug: string) => {
        const response = await fetch(`${API_URL}/pages/public/${slug}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch page');
        }
        return response.json();
    },

    createPage: async (data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create page');
        return response.json();
    },

    updatePage: async (id: number, data: any) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/pages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update page');
        return response.json();
    },

    deletePage: async (id: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/pages/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete page');
        return response.json();
    },

    // Support Chat
    sendSupportMessage: async (message: string, targetUserId?: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/support/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message, target_user_id: targetUserId })
        });
        if (!response.ok) throw new Error('Failed to send message');
        return response.json();
    },

    getSupportMessages: async (userId?: string) => {
        const token = localStorage.getItem('token');
        const url = userId
            ? `${API_URL}/support/messages?user_id=${userId}`
            : `${API_URL}/support/messages`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    getSupportConversations: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/support/conversations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return response.json();
    },

    uploadImage: async (file: File) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
        }
        return response.json();
    },

    markMessagesAsRead: async (userId: string) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/support/messages/mark-read`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId })
        });
        if (!response.ok) throw new Error('Failed to mark messages as read');
        return response.json();
    },
    // SEO API
    getPublicSeo: async () => {
        const response = await fetch(`${API_URL}/seo`);
        if (!response.ok) throw new Error('Failed to fetch SEO settings');
        return response.json();
    },

    // Notifications API
    getNotifications: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al cargar notificaciones');
        return response.json();
    },

    createNotification: async (data: { title: string, message: string, type: string }) => {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    },

    markNotificationRead: async (id: string) => {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    deleteNotification: async (id: string) => {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    clearNotifications: async () => {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/notifications`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
};
