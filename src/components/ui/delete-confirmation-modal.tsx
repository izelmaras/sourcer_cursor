import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { ModalWrapper } from './modal-wrapper';
import { ModalHeader } from './modal/modal-header';
import { ModalBody } from './modal/modal-body';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item? This action cannot be undone.'
}: DeleteConfirmationModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalWrapper>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p className="text-gray-600">
            {description}
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="bg-gray-100 text-gray-900 border border-gray-900 shadow-sm hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="bg-gray-100 text-gray-900 border border-gray-900 shadow-sm hover:bg-gray-200"
            >
              Delete
            </Button>
          </div>
        </ModalBody>
      </ModalWrapper>
    </Modal>
  );
};