import React from 'react';
import { cn } from '../../../lib/utils';

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalContent = ({ children, className }: ModalContentProps): JSX.Element => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div 
          className={cn(
            "relative bg-white w-full max-w-lg rounded-[32px] shadow-xl",
            className
          )}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};