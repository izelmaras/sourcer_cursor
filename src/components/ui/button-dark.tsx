import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonDarkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const ButtonDark = React.forwardRef<HTMLButtonElement, ButtonDarkProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-[#131313] text-white hover:bg-neutral-800': variant === 'default',
            'border border-neutral-700 bg-transparent text-white hover:bg-neutral-800': variant === 'outline',
            'bg-transparent text-white hover:bg-neutral-800': variant === 'ghost',
            'h-9 px-4 py-2': size === 'default',
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-8': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);