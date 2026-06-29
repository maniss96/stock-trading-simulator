'use client';

import { ReactNode, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';

export function Providers({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await authAPI.getProfile();
          if (data.success) {
            setUser(data.data);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [setUser, setLoading]);

  return <MainLayout>{children}</MainLayout>;
}
