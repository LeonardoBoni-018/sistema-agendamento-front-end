import { Outlet } from 'react-router-dom'
import { Sidebar } from '../../layout/Sidebar'
import { Header } from '../../layout/Header'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/appointments': 'Agendamentos',
    '/appointments/new': 'Novo Agendamento',
    '/jobs': 'Serviços',
    '/profile': 'Meu Perfil',
}

export function DashboardLayout() {
    const location = useLocation()
    const title = pageTitles[location.pathname] ?? 'Sistema de Agendamento'

    return (
        <div className="flex min-h-screen bg-[#13151a]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header title={title} />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}