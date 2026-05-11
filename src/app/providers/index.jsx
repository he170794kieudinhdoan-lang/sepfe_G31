import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/shared/contexts/ToastContext';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { LogoOrbitLoader } from '@/shared/components/LogoOrbitLoader';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
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
        <div className="flex h-screen w-screen items-center justify-center bg-transparent">
          <LogoOrbitLoader size={80} />
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
