import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, DollarSign } from 'lucide-react';

export const Header = () => {
    return (
        <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-extrabold tracking-tighter text-primary hover:opacity-90 transition-opacity flex items-center gap-1">
                        Work<span className="text-gray-800">Link</span>
                    </Link>

                    {/* Nav */}
                    <nav className="hidden md:flex gap-8 text-sm font-semibold">
                        <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
                            Việc làm
                        </Link>
                        <Link to="#" className="text-gray-700 hover:text-primary transition-colors">
                            Hồ sơ & CV
                        </Link>
                        <Link to="#" className="text-gray-700 hover:text-primary transition-colors">
                            Công ty
                        </Link>
                        <Link to="/demo/users" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                            API Demo
                        </Link>
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="text-gray-500 hover:text-primary font-semibold" asChild>
                        <Link to="/auth/login">
                            Đăng nhập
                        </Link>
                    </Button>
                    <Button className="font-bold px-6 bg-primary hover:bg-primary/90 text-white rounded shadow-md transition-transform active:scale-95">
                        Đăng tuyển
                    </Button>
                </div>
            </div>
        </header>
    );
};
