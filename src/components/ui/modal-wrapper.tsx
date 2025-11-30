import React from 'react';
import { cn } from '../../lib/utils';
import { modals } from '../../lib/design-tokens';

interface ModalWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ModalWrapper = ({ children, className, ...props }: ModalWrapperProps) => {
  return (
    <div
      className={cn(
        modals.wrapper.className,
        className
      )}
      style={modals.wrapper.style}
      {...props}
    >
      {children}
    </div>
  );
};