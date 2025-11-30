import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { ModalWrapper } from './modal-wrapper';
import { ModalHeader } from './modal/modal-header';
import { ModalBody } from './modal/modal-body';
import { backgrounds, borders, text, radius, utilities } from '../../lib/design-tokens';

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
    <Modal open={open} onClose={onClose} className={`${backgrounds.layer1} ${radius.modal} ${utilities.shadow.xl} ${borders.secondary} max-w-md mx-4`}>
      <ModalWrapper>
        <ModalHeader className={`border-b ${borders.secondary} p-6 pb-4`}>
          <h3 className={`text-lg font-semibold ${text.primary}`}>{title}</h3>
        </ModalHeader>
        <ModalBody className="p-6 pt-4">
          <p className={`${text.secondary} mb-6`}>
            {description}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              className={`${backgrounds.layer2} ${text.primary} ${borders.tertiary} ${backgrounds.hover.layer4}`}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-red-500/20 backdrop-blur-sm text-red-300 border border-red-400/30 hover:bg-red-500/30"
            >
              Delete
            </Button>
          </div>
        </ModalBody>
      </ModalWrapper>
    </Modal>
  );
};