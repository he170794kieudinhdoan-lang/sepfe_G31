import { Link } from 'react-router-dom';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background elements - Premium brand identity */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/5 -skew-x-12 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-full bg-primary/5 skew-x-12 -translate-x-1/3 pointer-events-none" />

      {/* Centering Engine */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full animate-in fade-in duration-500">
        <div className="w-full mx-auto" style={{ maxWidth: '480px' }}>
          {/* Brand Logo - Centered */}
          <div className="text-center mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-3xl font-black text-primary hover:opacity-80 transition-all active:scale-95"
            >
              <img src="/logo_02.png" alt="WorkLink" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Form Header Section */}
          {(title || subtitle) && (
            <div className="text-center mb-8 space-y-2">
              {title && (
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-slate-500 font-medium text-base">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* The Form Content */}
          <div className="w-full">{children}</div>

          {/* Consistent Auth Footer */}
          <footer className="mt-12 text-center">
            <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <span>© {new Date().getFullYear()} WorkLink</span>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <Link
                to="/terms"
                className="hover:text-primary transition-colors"
              >
                Điều khoản & Bảo mật
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
