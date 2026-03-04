import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Modal = ({
    open,
    title,
    description,
    children,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy",
    onConfirm,
    onClose,
    tone = "default",
    variant = "confirm",   // thêm dòng này
}) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-20 overflow-y-auto">
            <div
                className={cn(
                    "w-full rounded-2xl bg-white shadow-2xl border",
                    variant === "confirm" ? "max-w-lg" : "max-w-6xl"
                )}
            >
                {/* Header chỉ hiển thị khi confirm */}
                {variant === "confirm" && (
                    <div className="p-6 space-y-2 border-b">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        {description ? (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        ) : null}
                    </div>
                )}

                <div className={cn(variant === "confirm" ? "p-6 space-y-4" : "p-4 md:p-6")}>
                    {children}

                    {/* Footer chỉ hiển thị khi confirm */}
                    {variant === "confirm" && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={onClose}>
                                {cancelLabel}
                            </Button>
                            <Button
                                variant={tone === "danger" ? "destructive" : "default"}
                                onClick={onConfirm}
                                className={cn(
                                    tone === "danger" &&
                                    "bg-red-600 hover:bg-red-700"
                                )}
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
