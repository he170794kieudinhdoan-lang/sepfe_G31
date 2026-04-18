import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/shared/contexts/ToastContext';
import { AuthProvider } from '@/shared/contexts/AuthContext';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      // Bật lại: khi staleTime > 0, nếu tắt focus refetch thì quay lại tab vẫn thấy cache cũ
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Chỉ load Devtools ở dev, tránh kéo bundle vào production
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : null;

export const AppProvider = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          Đang tải...
          <div className="h-8 w-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            {children}
            {ReactQueryDevtools ? (
              <Suspense fallback={null}>
                <ReactQueryDevtools
                  initialIsOpen={false}
                  buttonPosition="bottom-right"
                />
              </Suspense>
            ) : null}
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
