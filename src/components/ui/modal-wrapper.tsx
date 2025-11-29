import React from 'react';
import { cn } from '../../lib/utils';

interface ModalWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalWrapper = ({ children, className, ...props }: ModalWrapperProps) => {
  return (
    <div
      className={cn(
        'relative backdrop-blur-xl rounded-[32px] border border-white/40 overflow-hidden w-full',
        className
      )}
      style={{ 
        backgroundColor: 'rgba(149, 153, 160, 0.90)',
        boxShadow: '0 0 40px rgba(255, 255, 255, 0.3), 0 0 80px rgba(255, 255, 255, 0.15), 0 20px 60px rgba(0, 0, 0, 0.3)'
      }}
      {...props}
    >
      {children}
    </div>
  );
};