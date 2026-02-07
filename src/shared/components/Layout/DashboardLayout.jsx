import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export const DashboardLayout = ({
    title,
    menu,
    activeKey,
    onSelect,
    children,
}) => {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="flex">
                <aside className="w-64 bg-white border-r px-5 py-6 hidden lg:flex flex-col">
                    <div className="text-2xl font-extrabold text-primary">WorkLink</div>
                    <div className="mt-8 space-y-1">
                        {menu.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => onSelect(item.key)}
                                className={cn(
                                    "w-full flex items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold transition",
                                    activeKey === item.key
                                        ? "bg-primary/10 text-foreground"
                                        : "text-muted-foreground hover:bg-gray-100"
                                )}
                            >
                                <span>{item.label}</span>
                                {activeKey === item.key && (
                                    <span className="text-xs text-primary">●</span>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>
                <div className="flex-1 min-w-0">
                    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b px-6 py-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{title}</h1>
                                <p className="text-sm text-muted-foreground">Bảng điều khiển WorkLink</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="hidden md:flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-2">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                        placeholder="Tìm nhanh"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Bell className="h-5 w-5" />
                                </Button>
                                <Button variant="outline" className="rounded-full px-4">
                                    Admin <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
                            {menu.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => onSelect(item.key)}
                                    className={cn(
                                        "flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold",
                                        activeKey === item.key
                                            ? "bg-primary/10 text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="px-6 py-8">{children}</div>
                </div>
            </div>
        </div>
    )
}
