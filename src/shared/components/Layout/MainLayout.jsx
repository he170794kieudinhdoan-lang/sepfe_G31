
import { Header } from './HeaderComp';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
