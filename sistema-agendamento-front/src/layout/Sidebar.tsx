import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    LayoutDashboard, CalendarDays, Hourglass, Scissors, UserCog, CalendarCheck2,
    ListOrdered, Users, Star, Settings2, UserRound, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

const ICON = { size: 16, strokeWidth: 1.75 }

interface SidebarProps {
    open: boolean
    onNavigate: () => void
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
    const { logout, user, isAdmin } = useAuthStore()
    const navigate = useNavigate()
    const admin = isAdmin()
    const [loggingOut, setLoggingOut] = useState(false)

    const groups = [
        {
            label: 'Agenda',
            items: [
                { to: '/dashboard', icon: <LayoutDashboard {...ICON} />, label: 'Início' },
                { to: '/appointments', icon: <CalendarDays {...ICON} />, label: 'Agendamentos' },
                { to: '/fila', icon: <Hourglass {...ICON} />, label: 'Fila de espera' },
            ],
        },
        ...(admin ? [{
            label: 'Gestão',
            items: [
                { to: '/jobs', icon: <Scissors {...ICON} />, label: 'Serviços' },
                { to: '/admin/funcionarios', icon: <UserCog {...ICON} />, label: 'Profissionais' },
                { to: '/admin/appointments', icon: <CalendarCheck2 {...ICON} />, label: 'Todos agendamentos' },
                { to: '/admin/fila', icon: <ListOrdered {...ICON} />, label: 'Fila admin' },
                { to: '/admin/clientes', icon: <Users {...ICON} />, label: 'Clientes' },
                { to: '/admin/avaliacoes', icon: <Star {...ICON} />, label: 'Avaliações' },
                { to: '/admin/configuracao', icon: <Settings2 {...ICON} />, label: 'Configurações' },
            ],
        }] : []),
        { label: 'Conta', items: [{ to: '/profile', icon: <UserRound {...ICON} />, label: 'Perfil' }] },
    ]

    const handleLogout = async () => {
        setLoggingOut(true)
        try { await authService.logout() } catch { /* a sessão local encerra mesmo assim */ } finally {
            logout()
            navigate('/login')
        }
    }

    return (
        <aside className="app-sidebar" data-open={open} style={{
            width: 240, background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            position: 'sticky', top: 0, height: '100vh',
        }}>
            <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: 'var(--accent)', color: 'var(--on-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px -4px var(--accent)',
                    }}>
                        <CalendarDays size={17} strokeWidth={2.25} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            fontSize: 13.5, fontWeight: 650, letterSpacing: '-0.02em',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.comercioNome ?? 'Agenda'}
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 5, marginTop: 2,
                            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em',
                            textTransform: 'uppercase', color: 'var(--text-muted)',
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
                                animation: 'pulse-ring 2s infinite',
                            }} />
                            {admin ? 'Admin · ao vivo' : 'Ao vivo'}
                        </div>
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
                {groups.map(g => (
                    <div key={g.label} style={{ marginBottom: 12 }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: 'var(--text-faint)',
                            padding: '6px 10px 4px',
                        }}>
                            {g.label}
                        </div>
                        {g.items.map(({ to, icon, label }) => (
                            <NavLink key={to} to={to} onClick={onNavigate}
                                     style={{ textDecoration: 'none', display: 'block' }}>
                                {({ isActive }) => (
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'flex', alignItems: 'center', gap: 9,
                                            padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                                            fontSize: 13, fontWeight: isActive ? 600 : 450,
                                            color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                                            background: isActive ? 'var(--bg-surface)' : 'transparent',
                                            marginBottom: 1, transition: 'all var(--transition)',
                                        }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-surface)' }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                    >
                                        {isActive && (
                                            <span style={{
                                                position: 'absolute', left: -8, top: 7, bottom: 7, width: 3,
                                                borderRadius: 3, background: 'var(--accent)',
                                                boxShadow: '0 0 10px var(--accent)',
                                            }} />
                                        )}
                                        <span style={{
                                            display: 'flex', flexShrink: 0,
                                            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                                        }}>{icon}</span>
                                        {label}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px', marginBottom: 4 }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                        padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                        fontSize: 13, color: 'var(--text-secondary)',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'all var(--transition)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                    <LogOut {...ICON} />
                    {loggingOut ? 'Saindo...' : 'Sair'}
                </button>
            </div>
        </aside>
    )
}
