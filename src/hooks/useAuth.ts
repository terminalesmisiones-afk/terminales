import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Session {
  access_token: string;
  user: User;
}

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

  const checkSession = useCallback(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          session: { access_token: token, user },
          loading: false,
          isAdmin: user.role === 'admin'
        });
      } catch (e) {
        console.error('Error parsing user session', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password, captchaToken?) => {
    try {
      const data = await api.login(email, password, captchaToken);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setAuthState({
        user: data.user,
        session: { access_token: data.token, user: data.user },
        loading: false,
        isAdmin: data.user.role === 'admin'
      });
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err };
    }
  };

  const signOut = useCallback(async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      session: null,
      loading: false,
      isAdmin: false
    });
  }, []);

  return {
    ...authState,
    login,
    signOut
  };
};
