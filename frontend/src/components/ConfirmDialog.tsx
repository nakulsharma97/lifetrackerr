import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Focus the confirm button after animation
      setTimeout(() => confirmRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl border border-surface-200 shadow-xl max-w-sm w-full p-6 animate-scale-in dark:bg-surface-900 dark:border-surface-800">
        <div className="flex items-start gap-4">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${variant === 'danger'
                ? 'bg-danger/5 text-danger'
                : 'bg-surface-100 text-ink-lighter'
              }
            `}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-ink dark:text-surface-100">
              {title}
            </h3>
            <p className="text-sm text-ink-light mt-1 dark:text-surface-300">
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            className="p-1 rounded-md text-ink-lighter hover:text-ink hover:bg-surface-100 transition-colors dark:hover:bg-surface-800 dark:hover:text-surface-100 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={variant === 'danger' ? 'btn-danger bg-danger text-white hover:bg-danger/90' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
