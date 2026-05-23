import api from './api'
import { Funcionario, FuncionarioRequest } from '@/types/funcionario'

export const funcionarioService = {
    getAtivos: async (): Promise<Funcionario[]> => {
        const res = await api.get('/v1/funcionario')
        return res.data
    },

    getTodos: async (): Promise<Funcionario[]> => {
        const res = await api.get('/v1/funcionario/todos')
        return res.data
    },

    criar: async (data: FuncionarioRequest): Promise<Funcionario> => {
        const res = await api.post('/v1/funcionario', data)
        return res.data
    },

    atualizar: async (
        id: number, data: FuncionarioRequest
    ): Promise<Funcionario> => {
        const res = await api.put(`/v1/funcionario/${id}`, data)
        return res.data
    },

    toggleAtivo: async (id: number): Promise<void> => {
        await api.put(`/v1/funcionario/${id}/toggle`)
    },
}