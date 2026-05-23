import { Outlet } from 'react-router-dom'
import { Sidebar } from 'src/layout/Sidebar'
import { Header }  from 'src/layout/Header'
//
export function DashboardLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Header />
                <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}