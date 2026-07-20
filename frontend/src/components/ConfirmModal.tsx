import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-xl shadow-xl border border-surface-200 p-6 animate-in fade-in zoom-in-95 dark:bg-surface-900 dark:border-surface-800">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-md text-ink-lighter hover:text-ink hover:bg-surface-100 transition-colors dark:hover:text-surface-100 dark:hover:bg-surface-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
          variant === 'danger'
            ? 'bg-danger/10 text-danger'
            : 'bg-surface-100 text-ink-light'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-ink mb-2 dark:text-surface-100">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-ink-light leading-relaxed mb-6 dark:text-surface-400">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={variant === 'danger' ? 'btn-danger text-sm' : 'btn-primary text-sm'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
