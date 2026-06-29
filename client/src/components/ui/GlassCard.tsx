'use client';

import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'sm' | 'lg' | 'flat';
  glow?: 'none' | 'primary' | 'success' | 'danger';
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  glow = 'none',
  hoverable = true,
  ...props
}: GlassCardProps) {
  const variants = {
    default: 'glass-card',
    sm: 'glass-card-sm',
    lg: 'glass-card-lg',
    flat: 'glass-card-flat',
  };

  const glowStyles = {
    none: '',
    primary: 'shadow-neon',
    success: 'shadow-neon-green',
    danger: 'shadow-neon-red',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        variants[variant],
        glowStyles[glow],
        !hoverable && 'hover:transform-none hover:bg-[rgba(255,255,255,0.08)]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function GlassCardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function GlassCardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  );
}
