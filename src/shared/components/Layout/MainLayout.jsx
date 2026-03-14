import { Header } from './HeaderComp';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';
import { Container } from '@/shared/components/Container';

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">
        <Container className="py-6 sm:py-8">
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
};
