import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/shared/components/EmptyState"
import { Modal } from "@/shared/components/Modal"
import { DashboardLayout } from "@/shared/components/Layout/DashboardLayout"
import { useToast } from "@/shared/contexts/ToastContext"
import { MSG } from "@/shared/constants/messages"

const kpi = [
    { label: "Total users", value: "12,540" },
    { label: "Total employers", value: "1,240" },
    { label: "Total companies", value: "860" },
    { label: "Total job postings", value: "4,520" },
]

const mockUsers = [
    {
        id: 1,
        name: "Nguyen Mai",
        email: "mai.nguyen@mail.com",
        role: "Worker",
        status: "Active",
        created: "2025-12-20",
    },
    {
        id: 2,
        name: "Tran Quang",
        email: "quang.tran@mail.com",
        role: "Employer",
        status: "Disabled",
        created: "2025-11-18",
    },
]

const mockSectors = [
    { id: 1, name: "Bán lẻ", created: "2025-10-12" },
    { id: 2, name: "Kho vận", created: "2025-09-09" },
]

export const AdminDashboard = () => {
    const { toast } = useToast()
    const [active, setActive] = useState("overview")
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [sectorModal, setSectorModal] = useState(false)
    const [editSector, setEditSector] = useState(null)
    const [sectorToDelete, setSectorToDelete] = useState(null)
    const [termsEditMode, setTermsEditMode] = useState(false)
    const [termsSaved, setTermsSaved] = useState("Nội dung điều khoản sử dụng WorkLink. Đây là bản mock cho giao diện admin quản trị.")
    const [termsDraft, setTermsDraft] = useState("")
    const [sectorName, setSectorName] = useState("")
    const isLoading = false
    const users = mockUsers

    const menu = [
        { key: "overview", label: "Tổng quan" },
        { key: "users", label: "Quản lý người dùng" },
        { key: "sectors", label: "Quản lý ngành nghề" },
        { key: "stats", label: "Thống kê hệ thống" },
        { key: "terms", label: "Điều khoản" },
    ]

    return (
        <DashboardLayout title="Admin Dashboard" menu={menu} activeKey={active} onSelect={setActive}>
            {active === "overview" && (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {kpi.map((item) => (
                            <Card key={item.label} className="p-5">
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                <p className="text-2xl font-bold mt-2">{item.value}</p>
                            </Card>
                        ))}
                    </div>
                    <div className="grid lg:grid-cols-3 gap-6">
                        <Card className="p-6 lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Chart hệ thống</h3>
                                <Badge variant="outline">Placeholder</Badge>
                            </div>
                            <div className="h-60 rounded-xl bg-gradient-to-br from-primary/10 via-white to-yellow-50 border border-dashed flex items-center justify-center text-muted-foreground">
                                Chart placeholder
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Summary</h3>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>New users (7 days)</span>
                                    <span className="font-semibold text-foreground">+420</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Companies pending</span>
                                    <span className="font-semibold text-foreground">18</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Reports unresolved</span>
                                    <span className="font-semibold text-foreground">12</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {active === "users" && (
                <div className="space-y-6">
                    <Card className="p-4 flex flex-wrap gap-3 items-center">
                        <select className="rounded-full border px-4 py-2 text-sm bg-white">
                            <option>Role</option>
                            <option>Worker</option>
                            <option>Employer</option>
                            <option>Manager</option>
                            <option>Admin</option>
                        </select>
                        <select className="rounded-full border px-4 py-2 text-sm bg-white">
                            <option>Status</option>
                            <option>Active</option>
                            <option>Disabled</option>
                        </select>
                        <Input type="date" className="max-w-[180px]" />
                        <Input type="date" className="max-w-[180px]" />
                        <Button className="rounded-full">Lọc</Button>
                        <Button variant="outline" className="rounded-full">Reset</Button>
                    </Card>

                    {users.length === 0 ? (
                        <EmptyState title={MSG.MSG10} description="Danh sách người dùng đang trống." />
                    ) : (
                        <Card className="p-4">
                            <table className="w-full text-sm">
                                <thead className="text-left text-muted-foreground">
                                    <tr className="border-b">
                                        <th className="py-2">Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Created date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b last:border-b-0">
                                            <td className="py-3 font-semibold">{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td>{user.created}</td>
                                            <td>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-full"
                                                    onClick={() => setConfirmOpen(true)}
                                                >
                                                    {user.status === "Active" ? "Disable" : "Enable"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )}
                </div>
            )}

            {active === "sectors" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Quản lý ngành nghề</h2>
                        <Button className="rounded-xl" onClick={() => { setSectorModal(true); setEditSector(null); setSectorName(""); }}>
                            Tạo ngành nghề
                        </Button>
                    </div>
                    <Card className="p-4">
                        <table className="w-full text-sm">
                            <thead className="text-left text-muted-foreground">
                                <tr className="border-b">
                                    <th className="py-2">Sector name</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockSectors.map((sector) => (
                                    <tr key={sector.id} className="border-b last:border-b-0">
                                        <td className="py-3 font-semibold">{sector.name}</td>
                                        <td>{sector.created}</td>
                                        <td className="flex gap-2 py-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full"
                                                onClick={() => { setEditSector(sector); setSectorName(sector.name); setSectorModal(true); }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="rounded-full"
                                                onClick={() => setSectorToDelete(sector)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {active === "stats" && (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {kpi.map((item) => (
                            <Card key={item.label} className="p-5">
                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                <p className="text-2xl font-bold mt-2">{item.value}</p>
                            </Card>
                        ))}
                    </div>
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Thống kê theo role</h3>
                            <Badge variant="outline">Placeholder</Badge>
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-52 w-full" />
                        ) : (
                            <div className="h-52 rounded-xl bg-slate-100 border border-dashed flex items-center justify-center text-muted-foreground">
                                Chart placeholder
                            </div>
                        )}
                    </Card>
                    {false && (
                        <EmptyState title={MSG.MSG66} description="Chưa có dữ liệu hệ thống." />
                    )}
                </div>
            )}

            {active === "terms" && (
                <div className="space-y-6">
                    <Card className="p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Điều khoản & điều kiện</h3>
                        {termsEditMode ? (
                            <>
                                <textarea
                                    className="w-full h-48 rounded-xl border p-4 text-sm resize-y"
                                    value={termsDraft}
                                    onChange={(e) => setTermsDraft(e.target.value)}
                                />
                                <div className="flex gap-2 mt-4">
                                    <Button className="rounded-xl" onClick={() => { setTermsSaved(termsDraft); setTermsEditMode(false); toast("Đã lưu điều khoản."); }}>
                                        Lưu
                                    </Button>
                                    <Button variant="outline" className="rounded-xl" onClick={() => { setTermsDraft(termsSaved); setTermsEditMode(false); }}>
                                        Hủy
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="h-48 overflow-y-auto rounded-xl border p-4 text-sm text-muted-foreground">
                                    {termsSaved}
                                </div>
                                <Button className="rounded-xl mt-4" onClick={() => { setTermsDraft(termsSaved); setTermsEditMode(true); }}>
                                    Chỉnh sửa
                                </Button>
                            </>
                        )}
                    </Card>
                </div>
            )}

            <Modal
                open={confirmOpen}
                title="Xác nhận thay đổi"
                description="Bạn chắc chắn muốn vô hiệu hóa/kích hoạt tài khoản?"
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => setConfirmOpen(false)}
                confirmLabel="Xác nhận"
            />

            <Modal
                open={sectorModal}
                title={editSector ? "Cập nhật ngành nghề" : "Tạo ngành nghề"}
                description="Nhập tên ngành nghề"
                onClose={() => { setSectorModal(false); setEditSector(null); setSectorName(""); }}
                onConfirm={() => { setSectorModal(false); setEditSector(null); setSectorName(""); toast("Đã lưu."); }}
                confirmLabel="Lưu"
            >
                <Input placeholder="Tên ngành nghề" value={editSector ? (sectorName || editSector.name) : sectorName} onChange={(e) => setSectorName(e.target.value)} className="rounded-xl" />
            </Modal>

            <Modal
                open={!!sectorToDelete}
                title="Xóa ngành nghề"
                description="Bạn chắc chắn muốn xóa ngành nghề này?"
                onClose={() => setSectorToDelete(null)}
                onConfirm={() => {
                    if (sectorToDelete?.id === 2) {
                        toast(MSG.MSG42, "error")
                    }
                    setSectorToDelete(null)
                }}
                confirmLabel="Xóa"
                tone="danger"
            />
        </DashboardLayout>
    )
}
