import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layout/Sidebar'
import { Header } from '@/layout/Header'

export function DashboardLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Header />
                <main style={{
                    flex: 1, padding: '24px 28px', overflowY: 'auto',
                    animation: 'fadeIn 0.25s ease both',
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}