import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Terminal, Schedule } from '@/types/terminal';

export const useSupabaseAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTerminal = useCallback(async (terminalData: Omit<Terminal, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      // Create terminal
      const { data: terminal, error: terminalError } = await supabase
        .from('terminals')
        .insert([{
          name: terminalData.name,
          city: terminalData.city,
          address: terminalData.address,
          image: terminalData.image,
          phone: terminalData.phone,
          email: '', // Will be added later with extended terminal type
          description: '',
          municipality_info: '',
          latitude: terminalData.latitude,
          longitude: terminalData.longitude,
          is_active: terminalData.isActive,
          schedules_visible: terminalData.schedulesVisible,
          company_count: terminalData.companyCount
        }])
        .select()
        .single();

      if (terminalError) throw terminalError;

      // Create schedules if any
      if (terminalData.schedules && terminalData.schedules.length > 0) {
        const schedulesData = terminalData.schedules.map(schedule => ({
          terminal_id: terminal.id,
          company: schedule.company,
          destination: schedule.destination,
          departure: schedule.departure,
          arrival: schedule.arrival,
          frequency: schedule.frequency,
          platform: schedule.platform
        }));

        const { error: schedulesError } = await supabase
          .from('schedules')
          .insert(schedulesData);

        if (schedulesError) throw schedulesError;
      }

      return terminal.id;
    } catch (err) {
      console.error('Error creating terminal:', err);
      setError(err instanceof Error ? err.message : 'Error creating terminal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTerminal = useCallback(async (id: string, terminalData: Partial<Terminal>) => {
    try {
      setLoading(true);
      setError(null);

      // Update terminal
      const { error: terminalError } = await supabase
        .from('terminals')
        .update({
          name: terminalData.name,
          city: terminalData.city,
          address: terminalData.address,
          image: terminalData.image,
          phone: terminalData.phone,
          latitude: terminalData.latitude,
          longitude: terminalData.longitude,
          is_active: terminalData.isActive,
          schedules_visible: terminalData.schedulesVisible,
          company_count: terminalData.companyCount
        })
        .eq('id', id);

      if (terminalError) throw terminalError;

      // Update schedules if provided
      if (terminalData.schedules) {
        // Delete existing schedules
        await supabase
          .from('schedules')
          .delete()
          .eq('terminal_id', id);

        // Insert new schedules
        if (terminalData.schedules.length > 0) {
          const schedulesData = terminalData.schedules.map(schedule => ({
            terminal_id: id,
            company: schedule.company,
            destination: schedule.destination,
            departure: schedule.departure,
            arrival: schedule.arrival,
            frequency: schedule.frequency,
            platform: schedule.platform
          }));

          const { error: schedulesError } = await supabase
            .from('schedules')
            .insert(schedulesData);

          if (schedulesError) throw schedulesError;
        }
      }
    } catch (err) {
      console.error('Error updating terminal:', err);
      setError(err instanceof Error ? err.message : 'Error updating terminal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTerminal = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('terminals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting terminal:', err);
      setError(err instanceof Error ? err.message : 'Error deleting terminal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File, fileName: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from('terminal-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('terminal-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Error uploading image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createTerminal,
    updateTerminal,
    deleteTerminal,
    uploadImage
  };
};