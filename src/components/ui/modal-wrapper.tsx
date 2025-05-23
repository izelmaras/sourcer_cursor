import React from 'react';
import { cn } from '../../lib/utils';

interface ModalWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalWrapper = ({ children, className, ...props }: ModalWrapperProps) => {
  return (
    <div
      className={cn(
        'relative bg-white rounded-[32px] shadow-xl overflow-hidden w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};