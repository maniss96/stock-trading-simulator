'use client';

import { useAuthStore, useUIStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bell, Search, Wallet, TrendingUp, Menu } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();

  return (
    <header className="glass-nav">
      <div className="flex items-center justify-between max-w-full mx-auto gap-2">
        {/* Left: hamburger (mobile) + Logo */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={toggleMobileMenu}
              aria-label="Open menu"
              className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-neon flex-shrink-0"
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
            <div className="hidden xs:block sm:block">
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">StockSim</h1>
              <p className="text-[10px] text-gray-400 -mt-0.5 hidden sm:block">AI Trading Simulator</p>
            </div>
          </Link>
        </div>

        {/* Center: Search bar (desktop only) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks (AAPL, TSLA, MSFT...)"
              className="glass-input pl-10 py-2 text-sm"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && user && (
            <>
              {/* Balance */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/20"
              >
                <Wallet className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                  {formatCurrency(user.balance)}
                </span>
              </motion.div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all hidden sm:block">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              </button>

              {/* User Avatar */}
              <Link
                href="/settings"
                className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white hover:opacity-80 transition-opacity flex-shrink-0"
              >
                {user.username.charAt(0).toUpperCase()}
              </Link>
            </>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="glass-btn text-xs px-3 sm:px-4 py-2">
                Sign In
              </Link>
              <Link href="/register" className="glass-btn-solid text-xs px-3 sm:px-4 py-2 whitespace-nowrap">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
