import api from './api'
import { DashboardData, Cliente, Avaliacao } from '@/types/dashboard'

export const dashboardService = {
    getDashboard: async (): Promise<DashboardData> => {
        const res = await api.get('/v1/dashboard')
        return res.data
    },

    getClientes: async (): Promise<Cliente[]> => {
        const res = await api.get('/v1/dashboard/clientes')
        return res.data
    },

    getAvaliacoes: async (): Promise<Avaliacao[]> => {
        const res = await api.get('/v1/avaliacao')
        return res.data
    },

    avaliar: async (
        appointmentId: number,
        nota: number,
        comentario?: string
    ): Promise<Avaliacao> => {
        const res = await api.post(`/v1/avaliacao/${appointmentId}`, {
            nota,
            comentario,
        })
        return res.data
    },
}