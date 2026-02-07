import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageWithFallback } from "@/components/ui/ImageWithFallback"

const DEFAULT_ILLUSTRATION = "https://placehold.co/280x200/fef3c7/eab308"

export const EmptyState = ({ title, description, actionLabel, imageUrl }) => {
  const img = imageUrl || DEFAULT_ILLUSTRATION
  return (
    <Card className="bg-white/90 rounded-xl overflow-hidden border-0 shadow-sm">
      <div className="p-8 text-center space-y-4">
        <div className="flex justify-center">
          <ImageWithFallback src={img} alt="" className="w-40 h-40 object-contain rounded-xl opacity-90" fallbackClassName="w-40 h-40 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center" />
        </div>
        <div className="text-sm font-semibold text-muted-foreground">Empty</div>
        <div className="text-lg font-semibold text-foreground">{title}</div>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
        ) : null}
        {actionLabel ? (
          <Button size="sm" className="mt-2 rounded-xl">{actionLabel}</Button>
        ) : null}
      </div>
    </Card>
  )
}
