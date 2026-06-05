import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/shared/contexts/ToastContext';
import { AuthProvider } from '@/shared/contexts/AuthContext';
import { AppLoadingScene } from '@/shared/components/AppLoadingScene';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dữ liệu được coi là "tươi" trong 60s: điều hướng qua lại / chuyển tab
      // sẽ dùng ngay cache thay vì refetch & nháy spinner -> UX nhanh hơn.
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      // staleTime > 0 nên quay lại tab vẫn thấy cache, chỉ refetch ngầm khi đã stale.
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
      fallback={<AppLoadingScene bgClassName="bg-white" />}
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
