import React from 'react';
import { Dialog } from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ open, onClose, children }: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-full px-4 sm:px-6 outline-none">
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};