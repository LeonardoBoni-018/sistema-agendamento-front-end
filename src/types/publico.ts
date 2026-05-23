import { HorarioFuncionamento } from './horario'
import { Job } from './job'
import { Funcionario } from './funcionario'

export interface ComercioPublico {
    id: number
    nome: string
    descricao: string | null
    telefone: string | null
    endereco: string | null
    servicos: Job[]
    funcionarios: Funcionario[]
    horarios: HorarioFuncionamento[]
}

export interface AgendamentoPublicoRequest {
    jobId: number
    date: string
    time: string
    funcionarioId?: number
    nome: string
    email: string
    telefone: string
    senha?: string
}