import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput } from '@/utils/security';

interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'user';
  created_at: string;
  last_sign_in_at?: string;
}

interface CreateUserRequest {
  email: string;
  password: string;
  display_name: string;
  role: 'admin' | 'user';
}

interface UpdateUserRequest {
  display_name?: string;
  role?: 'admin' | 'user';
}

export const useSupabaseUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logSecurityEvent = async (action: string, details?: any) => {
    try {
      await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource_type: 'user',
        p_resource_id: details?.user_id || null,
        p_details: details
      });
    } catch (err) {
      console.error('Failed to log security event:', err);
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profiles with role information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          role,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Transform to expected format
      const users: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        display_name: profile.display_name || '',
        role: profile.role as 'admin' | 'user',
        created_at: profile.created_at
      }));

      await logSecurityEvent('users_viewed', { count: users.length });
      return users;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching users';
      console.error('Error fetching users:', err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(userData.email.trim().toLowerCase()),
        display_name: sanitizeInput(userData.display_name.trim()),
        role: userData.role,
        password: userData.password // Don't sanitize password as it may contain special chars
      };

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength
      if (sanitizedData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: sanitizedData.email,
        password: sanitizedData.password,
        user_metadata: {
          display_name: sanitizedData.display_name
        },
        email_confirm: true // Auto-confirm for admin-created users
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: sanitizedData.role,
          display_name: sanitizedData.display_name 
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Add role to user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: sanitizedData.role
        });

      if (roleError) throw roleError;

      await logSecurityEvent('user_created', {
        user_id: authData.user.id,
        email: sanitizedData.email,
        role: sanitizedData.role
      });

      return authData.user.id;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating user';
      console.error('Error creating user:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, userData: UpdateUserRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Sanitize inputs
      const sanitizedData: UpdateUserRequest = {};
      if (userData.display_name) {
        sanitizedData.display_name = sanitizeInput(userData.display_name.trim());
      }
      if (userData.role) {
        sanitizedData.role = userData.role;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(sanitizedData)
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update role if provided
      if (sanitizedData.role) {
        // Delete existing role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: sanitizedData.role
          });

        if (roleError) throw roleError;
      }

      await logSecurityEvent('user_updated', {
        user_id: userId,
        changes: sanitizedData
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating user';
      console.error('Error updating user:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get user details before deletion for logging
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', userId)
        .single();

      // Delete user from auth (this will cascade to profiles and user_roles)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) throw deleteError;

      await logSecurityEvent('user_deleted', {
        user_id: userId,
        email: profile?.email,
        display_name: profile?.display_name
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting user';
      console.error('Error deleting user:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};