import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Terminal, Schedule } from '@/types/terminal';

export const useSupabaseTerminals = () => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTerminals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch terminals with their schedules
      const { data: terminalsData, error: terminalsError } = await supabase
        .from('terminals')
        .select(`
          *,
          schedules (*)
        `)
        .eq('is_active', true)
        .order('name');

      if (terminalsError) throw terminalsError;

      const formattedTerminals: Terminal[] = terminalsData?.map(terminal => ({
        id: terminal.id,
        name: terminal.name,
        city: terminal.city,
        address: terminal.address,
        image: terminal.image || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
        phone: terminal.phone,
        isActive: terminal.is_active,
        schedulesVisible: terminal.schedules_visible,
        companyCount: terminal.company_count || 0,
        lastUpdated: new Date(terminal.last_updated).toISOString(),
        latitude: terminal.latitude ? Number(terminal.latitude) : undefined,
        longitude: terminal.longitude ? Number(terminal.longitude) : undefined,
        schedules: terminal.schedules?.map((schedule: any) => ({
          id: parseInt(schedule.id.replace(/-/g, '').slice(0, 8), 16), // Convert UUID to number for compatibility
          company: schedule.company,
          destination: schedule.destination,
          departure: schedule.departure,
          arrival: schedule.arrival,
          frequency: schedule.frequency,
          platform: schedule.platform
        })) || []
      })) || [];

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

    // Set up realtime subscription
    const channel = supabase
      .channel('terminals-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'terminals' }, 
        () => {
          console.log('Terminal data changed, refreshing...');
          fetchTerminals();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'schedules' }, 
        () => {
          console.log('Schedule data changed, refreshing...');
          fetchTerminals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTerminals]);

  const refreshTerminals = useCallback(() => {
    fetchTerminals();
  }, [fetchTerminals]);

  return { terminals, loading, error, refreshTerminals };
};