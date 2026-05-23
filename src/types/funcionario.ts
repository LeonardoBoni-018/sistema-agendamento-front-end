export interface Funcionario {
    id: number
    nome: string
    especialidade: string | null
    telefone: string | null
    email: string | null
    ativo: boolean
    comercioId: number
    comercioNome: string
}

export interface FuncionarioRequest {
    nome: string
    especialidade?: string
    telefone?: string
    email?: string
}