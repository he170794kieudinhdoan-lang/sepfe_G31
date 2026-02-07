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
}) => {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border">
                <div className="p-6 space-y-2 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {description ? (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                <div className="p-6 space-y-4">
                    {children}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={onClose}>
                            {cancelLabel}
                        </Button>
                        <Button
                            variant={tone === "danger" ? "destructive" : "default"}
                            onClick={onConfirm}
                            className={cn(tone === "danger" && "bg-red-600 hover:bg-red-700")}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
