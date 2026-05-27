import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { useState } from 'react'

const ICONS = {
    dashboard: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
    ),
    calendar: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
    ),
    scissors: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
            <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
        </svg>
    ),
    users: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    book: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
    ),
    star: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    ),
    settings: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    ),
    clock: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    person: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    ),
    logout: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    userCheck: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <polyline points="16 11 18 13 22 9"/>
        </svg>
    ),
    list: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
    ),
}

export function Sidebar() {
    const { logout, user, isAdmin } = useAuthStore()
    const navigate = useNavigate()
    const admin = isAdmin()
    const [loggingOut, setLoggingOut] = useState(false)

    const navItems = [
        { to: '/dashboard', icon: ICONS.dashboard, label: 'Início' },
        { to: '/appointments', icon: ICONS.calendar, label: 'Agendamentos' },
        { to: '/fila', icon: ICONS.clock, label: 'Fila de espera' },
        ...(admin ? [
            { to: '/jobs', icon: ICONS.scissors, label: 'Serviços', divider: true },
            { to: '/admin/funcionarios', icon: ICONS.userCheck, label: 'Profissionais' },
            { to: '/admin/appointments', icon: ICONS.users, label: 'Todos agendamentos' },
            { to: '/admin/fila', icon: ICONS.list, label: 'Fila admin' },
            { to: '/admin/clientes', icon: ICONS.book, label: 'Clientes' },
            { to: '/admin/avaliacoes', icon: ICONS.star, label: 'Avaliações' },
            { to: '/admin/configuracao', icon: ICONS.settings, label: 'Configurações' },
        ] : []),
        { to: '/profile', icon: ICONS.person, label: 'Perfil', divider: true },
    ]

    const handleLogout = async () => {
        setLoggingOut(true)
        try { await authService.logout() } finally {
            logout()
            navigate('/login')
        }
    }

    return (
        <aside style={{
            width: 228,
            minHeight: '100vh',
            background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
        }}>
            {/* Logo */}
            <div style={{
                padding: '20px 16px 16px',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'var(--text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            fontSize: 13, fontWeight: 700, color: 'var(--text)',
                            letterSpacing: '-0.02em',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.comercioNome ?? 'Sistema'}
                        </div>
                        {admin && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--success)', display: 'inline-block',
                    animation: 'pulse-ring 2s infinite',
                }} />
                                <span style={{
                                    fontSize: 10, color: 'var(--success)',
                                    fontWeight: 600, letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                }}>
                  Admin
                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
                {navItems.map(({ to, icon, label, divider }, i) => (
                    <div key={to}>
                        {divider && i > 0 && (
                            <div style={{
                                height: 1, background: 'var(--border)',
                                margin: '6px 4px', marginTop: 10,
                            }} />
                        )}
                        <NavLink to={to} style={{ textDecoration: 'none', display: 'block' }}>
                            {({ isActive }) => (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                                    fontSize: 13,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                                    background: isActive ? 'var(--bg-surface)' : 'transparent',
                                    border: isActive
                                        ? '1px solid var(--border)'
                                        : '1px solid transparent',
                                    marginBottom: 2,
                                    transition: 'all var(--transition)',
                                    cursor: 'pointer',
                                }}
                                     onMouseEnter={e => {
                                         if (!isActive) {
                                             e.currentTarget.style.background = 'var(--bg-surface)'
                                             e.currentTarget.style.color = 'var(--text)'
                                         }
                                     }}
                                     onMouseLeave={e => {
                                         if (!isActive) {
                                             e.currentTarget.style.background = 'transparent'
                                             e.currentTarget.style.color = 'var(--text-secondary)'
                                         }
                                     }}
                                >
                  <span style={{
                      color: isActive ? 'var(--text)' : 'var(--text-muted)',
                      display: 'flex', flexShrink: 0,
                  }}>
                    {icon}
                  </span>
                                    {label}
                                </div>
                            )}
                        </NavLink>
                    </div>
                ))}
            </nav>

            {/* User */}
            <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                    marginBottom: 4,
                }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'var(--accent-dark)',
                        flexShrink: 0,
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontSize: 12, fontWeight: 600, color: 'var(--text)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.name}
                        </div>
                        <div style={{
                            fontSize: 11, color: 'var(--text-muted)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.email}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                        fontSize: 13, color: 'var(--text-secondary)',
                        background: 'transparent', border: '1px solid transparent',
                        cursor: 'pointer', transition: 'all var(--transition)',
                        fontFamily: 'var(--font)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--danger-light)'
                        e.currentTarget.style.color = 'var(--danger)'
                        e.currentTarget.style.borderColor = '#FECACA'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                        e.currentTarget.style.borderColor = 'transparent'
                    }}
                >
                    {ICONS.logout}
                    {loggingOut ? 'Saindo...' : 'Sair'}
                </button>
            </div>
        </aside>
    )
}