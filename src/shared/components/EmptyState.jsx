import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

export const EmptyState = ({ title, description, actionLabel, imageUrl }) => {
  return (
    <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/90 shadow-[0_18px_48px_-34px_rgba(15,23,42,0.28)]">
      <div className="bg-gradient-to-b from-white via-white to-amber-50/60 p-8 text-center space-y-4">
        {imageUrl && (
          <div className="mb-4 flex justify-center">
            <ImageWithFallback
              src={imageUrl}
              alt=""
              className="h-40 w-40 rounded-[1.5rem] object-contain opacity-95 shadow-sm"
              fallbackClassName="flex h-40 w-40 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner"
            />
          </div>
        )}
        <div className="space-y-2">
          <div className="text-xl font-black tracking-tight text-slate-900">{title}</div>
          <div className="mx-auto h-1.5 w-20 rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-transparent" />
        </div>
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
        {actionLabel ? (
          <Button size="sm" className="mt-2 rounded-full px-5 shadow-sm">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
