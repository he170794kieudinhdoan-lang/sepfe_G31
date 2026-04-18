import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { FullWidthLayout, MainLayout } from '@/shared/components/Layout';

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="h-8 w-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
  </div>
);

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage })),
);
const JobDetailPage = lazy(() =>
  import('@/pages/JobDetailPage').then((m) => ({ default: m.JobDetailPage })),
);
const JobSearchPage = lazy(() =>
  import('@/pages/JobSearchPage').then((m) => ({ default: m.JobSearchPage })),
);
const WishlistPage = lazy(() =>
  import('@/pages/WishlistPage').then((m) => ({ default: m.WishlistPage })),
);
const ChatPage = lazy(() =>
  import('@/features/chat/pages/ChatPage').then((m) => ({ default: m.ChatPage })),
);
const CompanyListPage = lazy(() =>
  import('@/features/companies/pages/CompanyListPage').then((m) => ({
    default: m.CompanyListPage,
  })),
);
const CompanyDetailPage = lazy(() =>
  import('@/features/companies/pages/CompanyDetailPage').then((m) => ({
    default: m.CompanyDetailPage,
  })),
);
const UserProfilePage = lazy(() =>
  import('@/pages/UserProfilePage').then((m) => ({ default: m.UserProfilePage })),
);
const WorkerWelcome = lazy(() =>
  import('@/pages/WorkerWelcome').then((m) => ({ default: m.WorkerWelcome })),
);
const WorkerProfileSetup = lazy(() =>
  import('@/pages/WorkerProfileSetup').then((m) => ({ default: m.WorkerProfileSetup })),
);
const TermsPage = lazy(() =>
  import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })),
);
const AdminDashboard = lazy(() =>
  import('@/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
const ManagerDashboard = lazy(() =>
  import('@/features/companies/pages/ManagerDashboard').then((m) => ({
    default: m.ManagerDashboard,
  })),
);
const CompanyApplicantPage = lazy(() =>
  import('@/features/companies/pages/CompanyApplicantPage').then((m) => ({
    default: m.CompanyApplicantPage,
  })),
);
const EmployerDashboard = lazy(() =>
  import('@/pages/EmployerDashboard').then((m) => ({ default: m.EmployerDashboard })),
);
const CreateJobPage = lazy(() =>
  import('@/pages/CreateJobPage').then((m) => ({ default: m.CreateJobPage })),
);
const EditJobPage = lazy(() =>
  import('@/pages/EditJobPage').then((m) => ({ default: m.EditJobPage })),
);
const JobApplyPage = lazy(() =>
  import('@/pages/JobApplyPage').then((m) => ({ default: m.JobApplyPage })),
);
const WorkerInvitations = lazy(() =>
  import('@/features/interview-invitations/components/WorkerInvitations').then((m) => ({
    default: m.default,
  })),
);

// Auth (group lazily)
const Login = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.Login })),
);
const RegisterChoose = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.RegisterChoose })),
);
const RegisterWorker = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.RegisterWorker })),
);
const RegisterEmployer = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.RegisterEmployer })),
);
const ForgotPassword = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.ForgotPassword })),
);
const ResetPassword = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.ResetPassword })),
);

const withSuspense = (node) => (
  <Suspense fallback={<PageFallback />}>{node}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <FullWidthLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'search', element: withSuspense(<JobSearchPage />) },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'chat', element: withSuspense(<ChatPage />) },
      { path: '/chat/:conversationId', element: withSuspense(<ChatPage />) },
      { path: 'job/:id', element: withSuspense(<JobDetailPage />) },
      { path: 'wishlist', element: withSuspense(<WishlistPage />) },
      { path: 'companies', element: withSuspense(<CompanyListPage />) },
      { path: 'company/:id', element: withSuspense(<CompanyDetailPage />) },
      { path: 'profile', element: withSuspense(<UserProfilePage />) },
      { path: 'profile/:id', element: withSuspense(<UserProfilePage />) },
      {
        path: 'interview-invitations',
        element: withSuspense(<WorkerInvitations />),
      },
      { path: 'terms', element: withSuspense(<TermsPage />) },
    ],
  },
  {
    path: '/admin',
    element: withSuspense(<AdminDashboard />),
  },
  {
    path: '/manager',
    element: withSuspense(<ManagerDashboard />),
  },
  {
    path: '/manager/applicants',
    element: withSuspense(<CompanyApplicantPage />),
  },
  {
    path: '/employer',
    element: withSuspense(<EmployerDashboard />),
    children: [
      {
        path: 'jobs',
        children: [
          { path: 'create', element: withSuspense(<CreateJobPage />) },
          { path: ':jobId/edit', element: withSuspense(<EditJobPage />) },
        ],
      },
    ],
  },
  { path: '/auth/login', element: withSuspense(<Login />) },
  { path: '/auth/register', element: withSuspense(<RegisterChoose />) },
  { path: '/auth/register/worker', element: withSuspense(<RegisterWorker />) },
  { path: '/auth/register/employer', element: withSuspense(<RegisterEmployer />) },
  { path: '/auth/forgot-password', element: withSuspense(<ForgotPassword />) },
  { path: '/auth/reset-password', element: withSuspense(<ResetPassword />) },
  { path: '/worker/welcome', element: withSuspense(<WorkerWelcome />) },
  { path: '/worker/setup-profile', element: withSuspense(<WorkerProfileSetup />) },
  { path: '/job/apply/:id', element: withSuspense(<JobApplyPage />) },
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
