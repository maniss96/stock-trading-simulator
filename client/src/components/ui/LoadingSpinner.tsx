'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          sizeStyles[size],
          'border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin'
        )}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card space-y-4">
      <div className="glass-skeleton h-4 w-3/4 rounded" />
      <div className="glass-skeleton h-8 w-1/2 rounded" />
      <div className="glass-skeleton h-3 w-full rounded" />
      <div className="glass-skeleton h-3 w-5/6 rounded" />
    </div>
  );
}
