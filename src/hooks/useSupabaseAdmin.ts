import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { Terminal } from '@/types/terminal';

export const useSupabaseAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTerminal = useCallback(async (terminalData: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.createTerminal(terminalData);
      return data.id;
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
      await api.updateTerminal(id, terminalData);
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
      await api.deleteTerminal(id);
    } catch (err) {
      console.error('Error deleting terminal:', err);
      setError(err instanceof Error ? err.message : 'Error deleting terminal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.uploadFile(file);
      return data.url;
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