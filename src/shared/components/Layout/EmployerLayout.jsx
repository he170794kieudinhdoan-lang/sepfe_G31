import { DashboardLayout } from './DashboardLayout'
import { Outlet, useNavigate } from 'react-router-dom'

export const EmployerLayout = () => {
    const navigate = useNavigate()

    const menu = [
        { key: 'overview', label: 'Tổng quan', path: '/employer' },
        { key: 'jobs', label: 'Tin tuyển dụng', path: '/employer/jobs' },
        { key: 'applicants', label: 'Ứng viên', path: '/employer/applicants' },
        { key: 'stats', label: 'Thống kê', path: '/employer/stats' },
    ]


    return (
        <DashboardLayout
            title="Employer Dashboard"
            menu={menu}
            activeKey="dashboard"
            onSelect={(key) => {
                const item = menu.find(m => m.key === key)
                if (item) navigate(item.path)
            }}
        >
            <Outlet />
        </DashboardLayout>
    )
}
