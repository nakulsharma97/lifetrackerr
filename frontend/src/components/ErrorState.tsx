import { useState } from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

// ─── Inline Error Banner ───────────────────────────────────

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onDismiss, onRetry }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-danger/20 bg-danger/5 animate-slide-up">
      <AlertCircle className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
      <p className="text-sm text-danger flex-1">{message}</p>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1 rounded-md text-danger hover:bg-danger/10 transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="p-1 rounded-md text-danger/60 hover:text-danger hover:bg-danger/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Full-page Error State ─────────────────────────────────

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorPage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorPageProps) {
  return (
    <div className="page-container">
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 rounded-xl bg-danger/5 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-danger" />
        </div>
        <h2 className="text-lg font-medium text-ink mb-1">{title}</h2>
        <p className="text-sm text-ink-lighter max-w-sm">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary mt-6">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
