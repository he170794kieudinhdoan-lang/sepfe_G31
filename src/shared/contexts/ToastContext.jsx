import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {}, clearToasts: () => {}, toasts: [] };
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, clearToasts, toasts }}>
      {children}
      <ToastList toasts={toasts} />
    </ToastContext.Provider>
  );
};

const ToastList = ({ toasts }) => (
  <div className="fixed top-18 right-5 z-[100] flex flex-col gap-3">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-start gap-3 rounded-2xl px-4 py-3 shadow-xl min-w-[300px] max-w-sm text-sm font-medium border transition-all duration-300 animate-slideIn ${
          t.type === 'error'
            ? 'bg-red-600 border-red-700 text-white shadow-red-500/40'
            : 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/40'
        }`}
      >
        {/* <div className="flex-1 flex items-center gap-2">
          {t.type === 'error' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {t.message}
        </div> */}
        <div className="flex-1">{t.message}</div>
      </div>
    ))}
  </div>
);
