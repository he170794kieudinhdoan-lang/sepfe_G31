import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, DollarSign } from 'lucide-react';

export const Header = () => {
    return (
        <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-extrabold tracking-tighter text-primary hover:opacity-90 transition-opacity flex items-center gap-1">
                        <img src='/logo_01.png' width={72}></img>
                    </Link>

                    {/* Nav */}
                    <nav className="hidden md:flex gap-8 text-sm font-semibold">
                        <Link to="/" className="text-gray-700 hover:text-yellow-400 transition-colors duration-200">
                            Việc làm
                        </Link>
                        <Link to="#" className="text-gray-700 hover:text-yellow-400 transition-colors duration-200">
                            Hồ sơ & CV
                        </Link>
                        <Link to="#" className="text-gray-700 hover:text-yellow-400 transition-colors duration-200">
                            Công ty
                        </Link>
                        <Link to="/demo/users" className="flex items-center gap-2 text-gray-700 hover:text-yellow-200 duration-200 transition-colors">
                            API Demo
                        </Link>
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="text-gray-500 hover:text-yellow-600 duration-200 transition-colors font-semibold" asChild>
                        <Link to="/auth/login">
                            Đăng nhập
                        </Link>
                    </Button>
                    <Button className="font-bold px-6 bg-yellow-200 hover:text-yellow-700 duration-200 text-black rounded shadow-md transition-transform active:scale-95">
                        Đăng tuyển
                    </Button>
                </div>
            </div>
        </header>
    );
};
