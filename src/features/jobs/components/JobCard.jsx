
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, DollarSign, Bookmark, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const JobCard = ({ job }) => {
    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 rounded-xl border">
                            <AvatarImage src={job.logoUrl} alt={job.companyName} className="object-contain p-2" />
                            <AvatarFallback className="rounded-xl bg-muted">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                                {job.title}
                            </h3>
                            <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                                {job.companyName}
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                                <span className="text-xs text-green-600 font-semibold">✓ Verified</span>
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Bookmark className="h-5 w-5" />
                    </Button>
                </div>

                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {job.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="font-medium">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-4 border-t mt-auto">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-bold gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.salary}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{job.updatedAt}</span>
                </div>
            </CardContent>
        </Card>
    );
};
