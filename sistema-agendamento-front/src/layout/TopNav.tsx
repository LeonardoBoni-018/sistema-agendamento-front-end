import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Plus, UserRound } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const MAIN = [
    { to: '/dashboard', label: 'Hoje' },
    { to: '/appointments', label: 'Agendamentos' },
    { to: '/fila', label: 'Fila de espera' },
]

const ADMIN = [
    { to: '/admin/appointments', label: 'Todos os agendamentos' },
    { to: '/admin/fila', label: 'Fila de espera (equipe)' },
    { to: '/jobs', label: 'Serviços' },
    { to: '/admin/funcionarios', label: 'Profissionais' },
    { to: '/admin/clientes', label: 'Clientes' },
    { to: '/admin/avaliacoes', label: 'Avaliações' },
    { to: '/admin/configuracao', label: 'Configurações' },
]

function useClickAway(onAway: () => void) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onAway() }
        const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onAway() }
        document.addEventListener('mousedown', h)
        document.addEventListener('keydown', k)
        return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k) }
    }, [onAway])
    return ref
}

export function TopNav() {
    const { logout, user, isAdmin } = useAuthStore()
    const navigate = useNavigate()
    const admin = isAdmin()
    const [gestao, setGestao] = useState(false)
    const [conta, setConta] = useState(false)
    const gestaoRef = useClickAway(() => setGestao(false))
    const contaRef = useClickAway(() => setConta(false))

    const handleLogout = async () => {
        try { await authService.logout() } catch { /* encerra a sessão local mesmo assim */ }
        logout()
        navigate('/login')
    }

    const link = (to: string, label: string, onClick?: () => void) => (
        <NavLink key={to} to={to} className="navlink" onClick={onClick}>
            <span>{label}</span>
        </NavLink>
    )

    return (
        <header className="topbar">
            <div className="topbar-inner">
                <div className="serif" style={{
                    fontSize: 24, lineHeight: 1, maxWidth: 220, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                }} title={user?.comercioNome ?? undefined}>
                    {user?.comercioNome ?? 'Agenda'}
                </div>

                <nav className="nav-desktop" style={{ display: 'flex', gap: 26, alignItems: 'center', flex: 1 }}>
                    {MAIN.map(l => link(l.to, l.label))}
                    {admin && (
                        <div ref={gestaoRef} style={{ position: 'relative', height: 60, display: 'flex', alignItems: 'center' }}>
                            <button
                                className="navlink"
                                aria-expanded={gestao}
                                onClick={() => setGestao(o => !o)}
                                style={{ background: 'none', border: 0, cursor: 'pointer', gap: 4 }}
                            >
                                <span>Gestão</span>
                                <ChevronDown size={14} />
                            </button>
                            {gestao && (
                                <div className="menu-pop" style={{ left: 0 }}>
                                    {ADMIN.map(l => (
                                        <NavLink key={l.to} to={l.to} className="menu-item" onClick={() => setGestao(false)}>
                                            {l.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                    {!admin && (
                        <button
                            onClick={() => navigate('/appointments/new')}
                            className="hide-mobile"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6, height: 34,
                                padding: '0 14px', fontSize: 13.5, fontWeight: 600,
                                background: 'var(--accent)', color: 'var(--on-accent)',
                                border: 0, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            }}
                        >
                            <Plus size={15} strokeWidth={2.25} /> Novo agendamento
                        </button>
                    )}
                    <ThemeToggle />
                    <NotificationBell />
                    <div ref={contaRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setConta(o => !o)}
                            aria-label="Conta"
                            aria-expanded={conta}
                            style={{
                                width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
                                background: 'var(--mark)', color: 'var(--on-mark)', border: 0,
                                fontSize: 13, fontWeight: 700,
                            }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </button>
                        {conta && (
                            <div className="menu-pop" style={{ right: 0 }}>
                                <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user?.email}
                                    </div>
                                </div>
                                <NavLink to="/profile" className="menu-item" onClick={() => setConta(false)}>
                                    <UserRound size={15} /> Meu perfil
                                </NavLink>
                                <button className="menu-item" onClick={handleLogout}>
                                    <LogOut size={15} /> Sair
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <nav className="nav-mobile" aria-label="Navegação">
                {[...MAIN, ...(admin ? ADMIN : [])].map(l => link(l.to, l.label))}
            </nav>
        </header>
    )
}
