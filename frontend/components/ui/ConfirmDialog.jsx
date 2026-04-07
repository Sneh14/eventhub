'use client';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title        = 'Are you sure?',
  description  = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  isLoading    = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={!isLoading ? onClose : undefined} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{description}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button data-testid="confirm-dialog-yes" id="confirm-dialog-yes" variant={variant} onClick={onConfirm} loading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
