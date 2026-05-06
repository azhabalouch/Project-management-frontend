import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className='pointer-events-none fixed right-4 top-4 z-[9999] flex max-w-[calc(100%-2rem)] flex-col gap-2'>
        {toasts.map((toast) => {
          const toneClasses = {
            success: 'border-[var(--pct-completed-text)] bg-[var(--pct-completed-bg)] text-[var(--pct-completed-text)]',
            error: 'border-[var(--status-error-text)] bg-[var(--status-error-bg)] text-[var(--status-error-text)]',
            info: 'border-[var(--status-inprogress-text)] bg-[var(--status-inprogress-bg)] text-[var(--status-inprogress-text)]',
          }[toast.type];

          return (
            <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium shadow-card-hover ${toneClasses}`}>
              <span className='min-w-0 flex-1'>{toast.message}</span>
              <button className='rounded px-1 text-lg opacity-70 transition-opacity hover:opacity-100' onClick={() => removeToast(toast.id)} aria-label='Dismiss'>
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
