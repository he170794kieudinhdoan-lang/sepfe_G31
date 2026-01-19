
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin } from 'lucide-react';

export const JobSearch = () => {
    return (
        <div className="relative py-24 bg-background overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 inset-x-0 h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <Badge className="mb-6 text-sm font-semibold">#1 Job Board for Tech</Badge>
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight tracking-tight">
                    Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">dream job</span> <br className="hidden md:block" />
                    without the hassle.
                </h1>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                    Thousands of jobs in the leading companies are waiting for you. Simple, fast and transparent.
                </p>

                <div className="bg-card p-2 rounded-full shadow-2xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto border">
                    <div className="flex-1 flex items-center px-4 py-1">
                        <Search className="text-muted-foreground mr-3 h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="Job title, keywords, or company"
                            className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                        />
                    </div>

                    <div className="hidden md:block w-px bg-border my-2"></div>

                    <div className="flex-1 flex items-center px-4 py-1">
                        <MapPin className="text-muted-foreground mr-3 h-5 w-5" />
                        <select className="w-full outline-none text-base bg-transparent text-foreground cursor-pointer appearance-none border-0 focus:ring-0">
                            <option>All Locations</option>
                            <option>Remote</option>
                            <option>New York, USA</option>
                            <option>London, UK</option>
                            <option>Vietnam</option>
                        </select>
                    </div>

                    <Button size="lg" className="rounded-full font-bold shadow-lg whitespace-nowrap">
                        Search Jobs
                    </Button>
                </div>

                <div className="mt-10 text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
                    <span>Popular Searches:</span>
                    <div className="flex gap-2 flex-wrap justify-center">
                        {['UI Designer', 'Software Engineer', 'Product Manager'].map(tag => (
                            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
