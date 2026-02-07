import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/shared/components/Layout';
import {
  LoginChoose,
  LoginWorker,
  LoginEmployer,
  RegisterChoose,
  RegisterWorker,
  RegisterEmployer,
  ForgotPassword,
  ResetPassword,
} from '@/features/auth';
import { HomePage } from '@/pages/HomePage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { JobListPage } from '@/pages/JobListPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { NotificationPage } from '@/pages/NotificationPage';
import { ChatPage } from '@/pages/ChatPage';
import { CompanyListPage } from '@/pages/CompanyListPage';
import { CompanyDetailPage } from '@/pages/CompanyDetailPage';
import { CompanyRegisterPage } from '@/pages/CompanyRegisterPage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { TermsPage } from '@/pages/TermsPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ManagerDashboard } from '@/pages/ManagerDashboard';
import { EmployerDashboard } from '@/pages/EmployerDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'jobs', element: <JobListPage /> },
      { path: 'job/:id', element: <JobDetailPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'notifications', element: <NotificationPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'companies', element: <CompanyListPage /> },
      { path: 'company/:id', element: <CompanyDetailPage /> },
      { path: 'company/register', element: <CompanyRegisterPage /> },
      { path: 'profile', element: <UserProfilePage /> },
      { path: 'profile/:id', element: <UserProfilePage /> },
      { path: 'terms', element: <TermsPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '/manager',
    element: <ManagerDashboard />,
  },
  {
    path: '/employer',
    element: <EmployerDashboard />,
  },
  { path: '/auth/login', element: <LoginChoose /> },
  { path: '/auth/login/worker', element: <LoginWorker /> },
  { path: '/auth/login/employer', element: <LoginEmployer /> },
  { path: '/auth/register', element: <RegisterChoose /> },
  { path: '/auth/register/worker', element: <RegisterWorker /> },
  { path: '/auth/register/employer', element: <RegisterEmployer /> },
  { path: '/auth/forgot-password', element: <ForgotPassword /> },
  { path: '/auth/reset-password', element: <ResetPassword /> },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">404</h1>
          <p className="text-muted-foreground">Trang không tồn tại.</p>
        </div>
      </div>
    ),
  },
]);
