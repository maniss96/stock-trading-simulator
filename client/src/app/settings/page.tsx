'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Shield, Bell, Palette, LogOut } from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput } from '@/components/ui/GlassInput';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Settings className="w-7 h-7 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-gray-400 text-sm">Manage your account and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-danger-400 hover:bg-danger-500/10 transition-all mt-4"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Profile Settings</GlassCardTitle>
              </GlassCardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{user?.username}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <GlassInput label="Username" defaultValue={user?.username} />
                <GlassInput label="Email" type="email" defaultValue={user?.email} />
                <GlassButton variant="solid" size="md">Save Changes</GlassButton>
              </div>
            </GlassCard>
          )}

          {activeTab === 'security' && (
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Security Settings</GlassCardTitle>
              </GlassCardHeader>
              <div className="space-y-4">
                <GlassInput label="Current Password" type="password" placeholder="Enter current password" />
                <GlassInput label="New Password" type="password" placeholder="Enter new password" />
                <GlassInput label="Confirm Password" type="password" placeholder="Confirm new password" />
                <GlassButton variant="solid" size="md">Update Password</GlassButton>
              </div>
            </GlassCard>
          )}

          {activeTab === 'notifications' && (
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Notification Preferences</GlassCardTitle>
              </GlassCardHeader>
              <div className="space-y-4">
                {['Trade executions', 'Price alerts', 'AI predictions', 'Leaderboard updates'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <span className="text-sm text-gray-300">{item}</span>
                    <div className="w-10 h-5 rounded-full bg-primary-600/30 border border-primary-500/30 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-primary-500" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === 'appearance' && (
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Appearance</GlassCardTitle>
              </GlassCardHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Theme is set to Dark Mode with Glassmorphism UI.</p>
                <p className="text-xs text-gray-500">Additional themes coming soon.</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
