import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

// ─── Context ───────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg border shadow-lg
              animate-slide-up backdrop-blur-sm
              ${toast.type === 'success'
                ? 'bg-success/10 border-success/20 text-success'
                : toast.type === 'error'
                  ? 'bg-danger/10 border-danger/20 text-danger'
                  : 'bg-surface-100 border-surface-300 text-ink-light'
              }
              dark:bg-surface-800 dark:border-surface-700
            `}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
