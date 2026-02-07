import { Link } from 'react-router-dom';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/50">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary mb-8">
            <img src="/logo_01.png" alt="WorkLink" className="h-8 w-auto" />
            WorkLink
          </Link>
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © WorkLink · <Link to="/terms" className="text-primary hover:underline">Điều khoản</Link>
      </footer>
    </div>
  );
};
