import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {}, toasts: [] };
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}
      <ToastList toasts={toasts} />
    </ToastContext.Provider>
  );
};

const ToastList = ({ toasts }) => (
  <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`rounded-xl border px-4 py-3 shadow-lg min-w-[280px] max-w-sm text-sm font-medium ${
          t.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-white border-primary/30 text-foreground'
        }`}
      >
        {t.message}
      </div>
    ))}
  </div>
);
