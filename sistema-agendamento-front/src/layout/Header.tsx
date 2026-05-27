import { useLocation } from 'react-router-dom'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { useAuthStore } from '@/store/authStore'

const pageMeta: Record<string, { title: string; desc: string }> = {
    '/dashboard': { title: 'Início', desc: 'Visão geral' },
    '/appointments': { title: 'Meus agendamentos', desc: 'Histórico e próximos' },
    '/appointments/new': { title: 'Novo agendamento', desc: 'Escolha serviço e horário' },
    '/fila': { title: 'Fila de espera', desc: 'Aguardando vagas' },
    '/jobs': { title: 'Serviços', desc: 'Catálogo do comércio' },
    '/admin/funcionarios': { title: 'Profissionais', desc: 'Equipe' },
    '/admin/appointments': { title: 'Todos os agendamentos', desc: 'Visão completa' },
    '/admin/fila': { title: 'Fila de espera', desc: 'Clientes aguardando' },
    '/admin/clientes': { title: 'Clientes', desc: 'Base de clientes' },
    '/admin/avaliacoes': { title: 'Avaliações', desc: 'Satisfação dos clientes' },
    '/admin/configuracao': { title: 'Configurações', desc: 'Horários e preferências' },
    '/profile': { title: 'Perfil', desc: 'Suas informações' },
}

export function Header() {
    const location = useLocation()
    const { user } = useAuthStore()
    const meta = pageMeta[location.pathname] ?? { title: 'Sistema', desc: '' }

    return (
        <header style={{
            height: 56,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'rgba(250,250,249,0.8)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div>
                    <h1 style={{
                        fontSize: 15, fontWeight: 600, color: 'var(--text)',
                        letterSpacing: '-0.02em', lineHeight: 1.2,
                    }}>
                        {meta.title}
                    </h1>
                    <p style={{
                        fontSize: 11, color: 'var(--text-muted)', marginTop: 1,
                    }}>
                        {meta.desc}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <NotificationBell />
                <div style={{
                    height: 20, width: 1, background: 'var(--border)', margin: '0 4px',
                }} />
                <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--accent-dark)',
                    cursor: 'default',
                }}
                     data-tooltip={user?.name}
                >
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    )
}