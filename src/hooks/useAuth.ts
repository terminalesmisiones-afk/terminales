import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false
  });

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      return !!data;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        let isAdmin = false;

        if (user) {
          // Defer admin check to prevent blocking
          setTimeout(async () => {
            const adminStatus = await checkAdminRole(user.id);
            setAuthState(prev => ({ ...prev, isAdmin: adminStatus }));
          }, 0);
        }

        setAuthState(prev => ({
          ...prev,
          user,
          session,
          loading: false,
          isAdmin: user ? prev.isAdmin : false
        }));
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      let isAdmin = false;

      if (user) {
        isAdmin = await checkAdminRole(user.id);
      }

      setAuthState({
        user,
        session,
        loading: false,
        isAdmin
      });
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    ...authState,
    signOut
  };
};