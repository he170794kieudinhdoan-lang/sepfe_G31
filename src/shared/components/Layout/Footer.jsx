
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-card border-t mt-20 pt-16 pb-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text mb-4 block">
                            WorkLink
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Connecting the world's best talent with the world's best companies. Join us to find your dream career today.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-foreground">Resources</h4>
                        <ul className="text-sm text-muted-foreground space-y-3">
                            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-foreground">For Candidates</h4>
                        <ul className="text-sm text-muted-foreground space-y-3">
                            <li><a href="#" className="hover:text-primary transition-colors">Browse Jobs</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Browse Companies</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Salary Calculator</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-foreground">Contact</h4>
                        <div className="space-y-3">
                            <a href="mailto:hello@worklink.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                <Mail className="h-4 w-4" />
                                hello@worklink.com
                            </a>
                            <a href="tel:+15551234567" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                <Phone className="h-4 w-4" />
                                +1 (555) 123-4567
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>© 2026 WorkLink Inc. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Security</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
