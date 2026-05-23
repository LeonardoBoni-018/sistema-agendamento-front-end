export interface ReceitaMensal {
    mes: string
    receita: number
    quantidade: number
}

export interface AgendamentosPorDia {
    dia: string
    quantidade: number
}

export interface DashboardData {
    totalAgendamentos: number
    agendamentosHoje: number
    agendamentosMes: number
    agendamentosConfirmados: number
    agendamentosPendentes: number
    agendamentosCancelados: number
    agendamentosFinalizados: number
    receitaTotal: number
    receitaMes: number
    receitaHoje: number
    mediaAvaliacao: number | null
    totalAvaliacoes: number
    servicoMaisAgendado: string
    horarioPico: string
    receitaPorMes: ReceitaMensal[]
    agendamentosPorDia: AgendamentosPorDia[]
    agendamentosPorStatus: Record<string, number>
    agendamentosPorServico: Record<string, number>
}

export interface Cliente {
    userId: number
    nome: string
    email: string
    telefone: string
    totalAgendamentos: number
    agendamentosFinalizados: number
    agendamentosCancelados: number
    ticketTotal: number
    ticketMedio: number
    primeiroAgendamento: string | null
    ultimoAgendamento: string | null
    servicoFavorito: string
    mediaAvaliacao: number
}

export interface Avaliacao {
    id: number
    appointmentId: number
    userId: number
    userName: string
    jobName: string
    nota: number
    comentario: string | null
    createdAt: string
}