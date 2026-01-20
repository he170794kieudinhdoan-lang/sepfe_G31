
import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const queryClient = new QueryClient();

export const AppProvider = ({ children }) => {
    return (
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
            <QueryClientProvider client={queryClient}>
                {children}
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            </QueryClientProvider>
        </Suspense>
    );
};
