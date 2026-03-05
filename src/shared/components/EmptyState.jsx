import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

export const EmptyState = ({ title, description, actionLabel, imageUrl }) => {
  return (
    <Card className="bg-white/90 rounded-xl overflow-hidden border-0 shadow-sm">
      <div className="p-8 text-center space-y-3">
        {imageUrl && (
          <div className="flex justify-center mb-4">
            <ImageWithFallback
              src={imageUrl}
              alt=""
              className="w-40 h-40 object-contain rounded-xl opacity-90"
              fallbackClassName="w-40 h-40 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center"
            />
          </div>
        )}
        <div className="text-lg font-semibold text-slate-800">{title}</div>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {description}
          </p>
        ) : null}
        {actionLabel ? (
          <Button size="sm" className="mt-2 rounded-xl">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
