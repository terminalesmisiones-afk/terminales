import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { Terminal } from '@/types/terminal';

export const useSupabaseTerminals = () => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTerminals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const terminalsData = await api.getAdminTerminals();

      const formattedTerminals: Terminal[] = terminalsData.map((terminal: any) => ({
        id: terminal.id,
        name: terminal.name,
        city: terminal.city,
        address: terminal.address,
        image: terminal.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
        phone: terminal.phone,
        isActive: Boolean(terminal.is_active),
        schedulesVisible: Boolean(terminal.schedules_visible),
        companyCount: terminal.schedules ? new Set(terminal.schedules.map((s: any) => s.company)).size : 0,
        lastUpdated: terminal.updated_at || new Date().toISOString(),
        latitude: terminal.latitude ? Number(terminal.latitude) : undefined,
        longitude: terminal.longitude ? Number(terminal.longitude) : undefined,
        schedules: terminal.schedules?.map((schedule: any) => ({
          id: schedule.id,
          company: schedule.company,
          destination: schedule.destination,
          remarks: schedule.remarks,
          departure_mon_fri: schedule.departure_mon_fri,
          departure_sat: schedule.departure_sat,
          departure_sun: schedule.departure_sun,
          platform: schedule.platform
        })) || [],
        google_sheet_url: terminal.google_sheet_url,
        description: terminal.description,
        municipalityInfo: terminal.municipality_info
      }));

      setTerminals(formattedTerminals);
    } catch (err) {
      console.error('Error fetching terminals:', err);
      setError(err instanceof Error ? err.message : 'Error loading terminals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerminals();
    // Realtime subscription removed for local version
  }, [fetchTerminals]);

  const refreshTerminals = useCallback(() => {
    fetchTerminals();
  }, [fetchTerminals]);

  return { terminals, loading, error, refreshTerminals };
};
