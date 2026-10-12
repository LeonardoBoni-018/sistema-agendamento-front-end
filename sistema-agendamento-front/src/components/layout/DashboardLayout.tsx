import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from '@/layout/TopNav'

const titles: Record<string, { title: string; desc: string }> = {
    '/appointments': { title: 'Agendamentos', desc: 'Seus horários marcados, do próximo ao mais antigo.' },
    '/appointments/new': { title: 'Novo agendamento', desc: 'Escolha o serviço, o dia e o horário.' },
    '/fila': { title: 'Fila de espera', desc: 'Entre na fila e avisamos quando abrir uma vaga.' },
    '/jobs': { title: 'Serviços', desc: 'O que você oferece, com duração e preço.' },
    '/admin/funcionarios': { title: 'Profissionais', desc: 'Quem atende e em quais dias.' },
    '/admin/appointments': { title: 'Todos os agendamentos', desc: 'A agenda completa do negócio.' },
    '/admin/fila': { title: 'Fila de espera', desc: 'Clientes aguardando uma vaga.' },
    '/admin/clientes': { title: 'Clientes', desc: 'Quem já agendou com você.' },
    '/admin/avaliacoes': { title: 'Avaliações', desc: 'O que os clientes acharam do atendimento.' },
    '/admin/configuracao': { title: 'Configurações', desc: 'Horários de funcionamento, bloqueios e pagamento.' },
    '/profile': { title: 'Meu perfil', desc: 'Seus dados de contato.' },
}

export function DashboardLayout() {
    const { pathname } = useLocation()
    const meta = titles[pathname]

    return (
        <div style={{ minHeight: '100vh' }}>
            <TopNav />
            <main className="page">
                {meta && (
                    <div style={{ marginBottom: 28 }}>
                        <h1 className="page-title">{meta.title}</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: 6, maxWidth: 560 }}>{meta.desc}</p>
                    </div>
                )}
                <Outlet />
            </main>
        </div>
    )
}
