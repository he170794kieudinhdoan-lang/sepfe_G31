
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/shared/components/Layout';

import { LoginRoute } from '@/features/auth';
import { ProductsRoute } from '@/features/products';
import { JobsPage } from '@/features/jobs';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <JobsPage />,
            },
            {
                path: 'app/products',
                element: <ProductsRoute />,
            },
        ],
    },
    {
        path: '/auth/login',
        element: <LoginRoute />,
    },
    {
        path: '*',
        element: <div className="p-10 text-center">404 Not Found</div>,
    }
]);
