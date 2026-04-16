import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from '@/shared/contexts/ToastContext';
import { AuthProvider } from '@/shared/contexts/AuthContext';

export const queryClient = new QueryClient();

export const AppProvider = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center">
          Đang tải...
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            {children}
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-right"
            />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
