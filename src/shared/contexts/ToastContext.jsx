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
  <div className='fixed top-18 right-5 z-[100] flex flex-col gap-3'>
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-start gap-3 rounded-2xl px-4 py-3 shadow-xl min-w-[300px] max-w-sm text-sm font-medium border backdrop-blur-md transition-all duration-300 animate-slideIn ${
          t.type === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-600'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
        }`}
      >
        <div className='flex-1'>{t.message}</div>
      </div>
    ))}
  </div>
);
