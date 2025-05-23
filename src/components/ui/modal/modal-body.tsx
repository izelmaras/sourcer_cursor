import React from 'react';
import { cn } from '../../../lib/utils';

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody = ({ children, className }: ModalBodyProps): JSX.Element => {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
};