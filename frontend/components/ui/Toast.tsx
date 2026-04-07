'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';
export type AddToast = (message: string, type?: ToastType) => void;

interface ToastData {
  id:      string;
  message: string;
  type:    ToastType;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<AddToast | null>(null);

// ── Individual toast item ─────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, { bar: string; icon: string; wrap: string }> = {
  success: { bar: 'bg-emerald-500', icon: '✓', wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error:   { bar: 'bg-red-500',     icon: '✕', wrap: 'border-red-200   bg-red-50   text-red-800'   },
  info:    { bar: 'bg-blue-500',    icon: 'ℹ', wrap: 'border-blue-200  bg-blue-50  text-blue-800'  },
  warning: { bar: 'bg-amber-500',   icon: '⚠', wrap: 'border-amber-200 bg-amber-50 text-amber-800' },
};

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const s = TOAST_STYLES[toast.type] ?? TOAST_STYLES.info;

  return (
    <div
      className={`
        relative overflow-hidden flex items-start gap-3 p-4 pr-8
        rounded-xl border shadow-lg animate-slide-in-right
        ${s.wrap}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
      <span className="font-bold text-base leading-none mt-0.5 ml-1">{s.icon}</span>
      <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute top-3 right-3 opacity-50 hover:opacity-100 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback<AddToast>((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 w-80 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns `addToast(message, type)` where type is 'success' | 'error' | 'info' | 'warning'.
 */
export function useToast(): AddToast {
  const ctx = useContext(ToastContext);
  if (ctx === null) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
