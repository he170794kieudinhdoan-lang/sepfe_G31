import { createBrowserRouter } from 'react-router-dom';
import { FullWidthLayout, MainLayout } from '@/shared/components/Layout';
import {
  Login,
  RegisterChoose,
  RegisterWorker,
  RegisterEmployer,
  ForgotPassword,
  ResetPassword,
} from '@/features/auth';
import { HomePage } from '@/pages/HomePage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { JobSearchPage } from '@/pages/JobSearchPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { ChatPage } from '@/features/chat/pages/ChatPage';
import { CompanyListPage } from '@/features/companies/pages/CompanyListPage';
import { CompanyDetailPage } from '@/features/companies/pages/CompanyDetailPage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { WorkerWelcome } from '@/pages/WorkerWelcome';
import { WorkerProfileSetup } from '@/pages/WorkerProfileSetup';
import { TermsPage } from '@/pages/TermsPage';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ManagerDashboard } from '@/features/companies/pages/ManagerDashboard';
import { CompanyApplicantPage } from '@/features/companies/pages/CompanyApplicantPage';
import { EmployerDashboard } from '@/pages/EmployerDashboard';
import { EmployerLayout } from '@/shared/components/Layout/EmployerLayout';
import { CreateJobPage } from '@/pages/CreateJobPage';
import { EditJobPage } from '@/pages/EditJobPage';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <FullWidthLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <JobSearchPage /> },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/chat/:conversationId', element: <ChatPage /> },
      { path: 'job/:id', element: <JobDetailPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'companies', element: <CompanyListPage /> },
      { path: 'company/:id', element: <CompanyDetailPage /> },
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
    path: '/manager/applicants',
    element: <CompanyApplicantPage />,
  },
  {
    path: '/employer',
    element: <EmployerDashboard />,
    children: [
      {
        path: 'jobs',
        children: [
          { path: 'create', element: <CreateJobPage /> },
          { path: ':jobId/edit', element: <EditJobPage /> },
        ],
      },
    ],
  },
  { path: '/auth/login', element: <Login /> },
  { path: '/auth/register', element: <RegisterChoose /> },
  { path: '/auth/register/worker', element: <RegisterWorker /> },
  { path: '/auth/register/employer', element: <RegisterEmployer /> },
  { path: '/auth/forgot-password', element: <ForgotPassword /> },
  { path: '/auth/reset-password', element: <ResetPassword /> },
  { path: '/worker/welcome', element: <WorkerWelcome /> },
  { path: '/worker/setup-profile', element: <WorkerProfileSetup /> },
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
