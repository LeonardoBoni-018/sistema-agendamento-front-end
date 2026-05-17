import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Calendar,
    Briefcase,
    User,
    LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/appointments', icon: Calendar, label: 'Agendamentos' },
    { to: '/jobs', icon: Briefcase, label: 'Serviços' },
    { to: '/profile', icon: User, label: 'Perfil' },
]

export function Sidebar() {
    const { logout, user } = useAuthStore()

    const handleLogout = async () => {
        await authService.logout()
        logout()
    }

    return (
        <aside className="w-60 min-h-screen bg-[#0f1117] border-r border-white/5 flex flex-col">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-black text-sm">
                    S.
                </div>
                <span className="text-white font-semibold text-sm">Sistema Agendamento</span>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                isActive
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-3 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    )
}