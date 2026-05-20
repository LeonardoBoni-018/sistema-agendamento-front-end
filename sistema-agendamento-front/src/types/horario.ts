export type DiaSemana =
    | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY'
    | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export const DIA_LABELS: Record<DiaSemana, string> = {
    MONDAY: 'Segunda-feira',
    TUESDAY: 'Terça-feira',
    WEDNESDAY: 'Quarta-feira',
    THURSDAY: 'Quinta-feira',
    FRIDAY: 'Sexta-feira',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
}

export const DIAS_SEMANA: DiaSemana[] = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY',
    'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]

export interface HorarioFuncionamento {
    id: number
    diaSemana: DiaSemana
    diaSemanaLabel: string
    abertura: string | null
    fechamento: string | null
    aberto: boolean
}

export interface HorarioFuncionamentoRequest {
    diaSemana: DiaSemana
    abertura?: string
    fechamento?: string
    aberto: boolean
}

export interface BloqueioHorario {
    id: number
    dataInicio: string
    dataFim: string
    horaInicio: string | null
    horaFim: string | null
    motivo: string | null
    diaInteiro: boolean
}

export interface BloqueioHorarioRequest {
    dataInicio: string
    dataFim: string
    horaInicio?: string
    horaFim?: string
    motivo?: string
    diaInteiro: boolean
}