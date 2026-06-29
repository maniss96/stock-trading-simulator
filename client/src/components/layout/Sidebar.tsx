'use client';

import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Trophy,
  Brain,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/trading', icon: TrendingUp, label: 'Trading' },
  { href: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/predictions', icon: Brain, label: 'AI Predictions' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/learn', icon: BookOpen, label: 'Learn' },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          'glass-sidebar pt-20 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-24 -right-3 z-50 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-lg hover:bg-primary-500 transition-colors"
        >
          <ChevronLeft
            className={cn(
              'w-3 h-3 transition-transform',
              !sidebarOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Navigation */}
        <nav className="px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive && 'text-primary-400'
                  )}
                />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          {sidebarOpen && user && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-gray-400">Rank #{user.rank || '—'}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Link
              href="/settings"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              <Settings className="w-4 h-4" />
              {sidebarOpen && 'Settings'}
            </Link>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
