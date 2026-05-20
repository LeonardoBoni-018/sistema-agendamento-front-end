import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

export function Sidebar() {
    const { logout, user, isAdmin } = useAuthStore()
    const navigate = useNavigate()
    const admin = isAdmin()

    const navItems = [
        { to: '/dashboard', icon: 'ti-layout-dashboard', label: 'Início' },
        { to: '/appointments', icon: 'ti-calendar', label: 'Meus agendamentos' },
        ...(admin ? [
            { to: '/jobs', icon: 'ti-scissors', label: 'Serviços' },
            { to: '/admin/appointments', icon: 'ti-users', label: 'Todos agendamentos' },
        ] : []),
        { to: '/profile', icon: 'ti-user', label: 'Perfil' },
    ]

    const handleLogout = async () => {
        try { await authService.logout() } finally {
            logout()
            navigate('/login')
        }
    }

    return (
        <aside style={{
            width: 220,
            minHeight: '100vh',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            flexShrink: 0,
        }}>
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--accent)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 14, fontWeight: 600,
                    }}>
                        {user?.comercioNome?.charAt(0) ?? 'S'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            fontSize: 13, fontWeight: 600, color: 'var(--text)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.comercioNome ?? 'Sistema'}
                        </div>
                        {admin && (
                            <div style={{
                                fontSize: 11, color: 'var(--accent)',
                                fontWeight: 500, letterSpacing: '0.04em',
                            }}>
                                Administrador
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '12px 10px' }}>
                {navItems.map(({ to, icon, label }) => (
                    <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                        {({ isActive }) => (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                                fontSize: 13, fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                                background: isActive ? 'var(--bg-card)' : 'transparent',
                                border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                                marginBottom: 2, transition: 'all 0.1s', cursor: 'pointer',
                            }}>
                                <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 16 }} />
                                {label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '16px 10px', borderTop: '1px solid var(--border)' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', marginBottom: 4,
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--accent-light)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, color: 'var(--accent-dark)',
                        flexShrink: 0,
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            fontSize: 12, fontWeight: 600, color: 'var(--text)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.name}
                        </div>
                        <div style={{
                            fontSize: 11, color: 'var(--text-faint)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {user?.email}
                        </div>
                    </div>
                </div>
                <button onClick={handleLogout} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 'var(--radius-sm)',
                    fontSize: 13, color: 'var(--danger)', background: 'transparent',
                    border: '1px solid transparent', cursor: 'pointer',
                    transition: 'all 0.1s',
                }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-light)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <i className="ti ti-logout" aria-hidden="true" style={{ fontSize: 16 }} />
                    Sair
                </button>
            </div>
        </aside>
    )
}