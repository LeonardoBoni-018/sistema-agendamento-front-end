import { useLocation } from 'react-router-dom'
import { NotificationBell } from '@/components/shared/NotificationBell'

const pageTitles: Record<string, { title: string; desc: string }> = {
    '/dashboard': { title: 'Início', desc: 'Visão geral dos agendamentos' },
    '/appointments': { title: 'Meus agendamentos', desc: 'Histórico e próximos horários' },
    '/appointments/new': { title: 'Novo agendamento', desc: 'Escolha um serviço e horário' },
    '/jobs': { title: 'Serviços', desc: 'Gerencie os serviços do comércio' },
    '/admin/funcionarios': { title: 'Profissionais', desc: 'Equipe do comércio' },
    '/admin/appointments': { title: 'Todos os agendamentos', desc: 'Visão completa do comércio' },
    '/admin/clientes': { title: 'Clientes', desc: 'Painel de clientes' },
    '/admin/avaliacoes': { title: 'Avaliações', desc: 'Avaliações pós-atendimento' },
    '/admin/configuracao': { title: 'Configurações', desc: 'Horários e bloqueios' },
    '/profile': { title: 'Perfil', desc: 'Suas informações pessoais' },
}

export function Header() {
    const location = useLocation()
    const page = pageTitles[location.pathname] ?? { title: 'Sistema', desc: '' }

    return (
        <header style={{
            height: 60, borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px', background: 'var(--bg-card)',
        }}>
            <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
                    {page.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                    {page.desc}
                </div>
            </div>
            <NotificationBell />
        </header>
    )
}