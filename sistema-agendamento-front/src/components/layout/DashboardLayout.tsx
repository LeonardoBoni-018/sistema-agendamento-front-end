import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layout/Sidebar'
import { Header } from '@/layout/Header'

export function DashboardLayout() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="app-shell">
            <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
            <div className="app-scrim" data-open={menuOpen} onClick={() => setMenuOpen(false)} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Header onMenu={() => setMenuOpen(true)} />
                <main className="app-main" style={{
                    flex: 1, padding: '24px 28px',
                    animation: 'fadeIn 0.25s ease both',
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
