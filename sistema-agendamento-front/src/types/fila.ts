export type FilaStatus = 'AGUARDANDO' | 'NOTIFICADO' | 'AGENDADO' | 'EXPIRADO'

export interface FilaEspera {
    id: number
    userId: number
    userName: string
    jobId: number
    jobName: string
    comercioId: number
    comercioNome: string
    funcionarioId: number | null
    funcionarioNome: string | null
    date: string
    horarioPreferido: string | null
    status: FilaStatus
    posicao: number
}

export interface FilaEsperaRequest {
    jobId: number
    date: string
    horarioPreferido?: string
    funcionarioId?: number
}