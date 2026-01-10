
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export interface Banner {
    id: string | number;
    title: string;
    imageUrl: string;
    linkUrl: string;
    htmlCode?: string;
    uploadType: 'url' | 'file' | 'html';
    position: string;
    terminal: string;
    deviceType: string;
    showOnMobile: boolean;
    showOnTablet: boolean;
    showOnDesktop: boolean;
    isActive: boolean;
    startDate: string;
    endDate: string;
    clicks: number;
    impressions: number;
}

export const useBanners = (position?: string) => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const data = await api.getBanners();

                let mappedData = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    imageUrl: item.image_url || '',
                    linkUrl: item.link_url || '',
                    htmlCode: item.html_code || '',
                    uploadType: item.upload_type || 'url',
                    position: item.position || 'header',
                    terminal: item.terminal_id || 'all',
                    deviceType: item.device_type || 'all',
                    showOnMobile: Boolean(item.show_on_mobile),
                    showOnTablet: Boolean(item.show_on_tablet),
                    showOnDesktop: Boolean(item.show_on_desktop),
                    isActive: Boolean(item.is_active),
                    startDate: item.start_date || '',
                    endDate: item.end_date || '',
                    clicks: item.clicks || 0,
                    impressions: item.impressions || 0
                }));

                // Filter valid banners
                const now = new Date();
                mappedData = mappedData.filter((b: Banner) => {
                    if (!b.isActive) return false;
                    if (b.startDate && new Date(b.startDate) > now) return false;
                    if (b.endDate && new Date(b.endDate) < now) return false;
                    if (position && b.position !== position) return false;
                    return true;
                });

                setBanners(mappedData);
            } catch (err: any) {
                console.error('Error loading banners:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, [position]);

    return { banners, loading, error };
};
