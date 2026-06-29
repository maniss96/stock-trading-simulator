'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuthStore, useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Navigation */}
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar (only when authenticated) */}
        {isAuthenticated && <Sidebar />}

        {/* Main content */}
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-4rem)] p-6 transition-all duration-300',
            isAuthenticated && (sidebarOpen ? 'ml-64' : 'ml-20')
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
