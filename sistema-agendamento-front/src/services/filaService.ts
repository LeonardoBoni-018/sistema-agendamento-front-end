import api from './api'
import { FilaEspera, FilaEsperaRequest } from '@/types/fila'

export const filaService = {
    entrar: async (data: FilaEsperaRequest): Promise<FilaEspera> => {
        const res = await api.post('/v1/fila', data)
        return res.data
    },

    minhaFila: async (): Promise<FilaEspera[]> => {
        const res = await api.get('/v1/fila/me')
        return res.data
    },

    sair: async (filaId: number): Promise<void> => {
        await api.delete(`/v1/fila/${filaId}`)
    },

    filaDoComercio: async (): Promise<FilaEspera[]> => {
        const res = await api.get('/v1/fila/comercio')
        return res.data
    },
}