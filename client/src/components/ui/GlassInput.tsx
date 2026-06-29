'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'glass-input',
              icon && 'pl-10',
              error && 'border-danger-500/50 focus:border-danger-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-danger-400 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
