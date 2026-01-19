
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProvider } from './providers';

export const App = () => {
    return (
        <AppProvider>
            <RouterProvider router={router} />
        </AppProvider>
    );
};
