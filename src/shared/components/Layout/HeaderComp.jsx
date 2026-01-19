
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, DollarSign } from 'lucide-react';

export const Header = () => {
    return (
        <header className="bg-background/80 backdrop-blur-xl sticky top-0 z-50 border-b">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text hover:opacity-80 transition-opacity">
                        WorkLink
                    </Link>

                    {/* Nav */}
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                            <Briefcase className="h-4 w-4" />
                            Find Jobs
                        </Link>
                        <Link to="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <Building2 className="h-4 w-4" />
                            Companies
                        </Link>
                        <Link to="#" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <DollarSign className="h-4 w-4" />
                            Salaries
                        </Link>
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" asChild>
                        <Link to="/auth/login">
                            Sign In
                        </Link>
                    </Button>
                    <Button className="rounded-full shadow-lg">
                        Post a Job
                    </Button>
                </div>
            </div>
        </header>
    );
};
