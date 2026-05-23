import api from './api'
import { Pagamento } from '@/types/pagamento'

export const pagamentoService = {
    gerarCheckout: async (appointmentId: number): Promise<Pagamento> => {
        const res = await api.post(`/v1/pagamento/checkout/${appointmentId}`)
        return res.data
    },

    getByAppointment: async (
        appointmentId: number
    ): Promise<Pagamento | null> => {
        try {
            const res = await api.get(`/v1/pagamento/appointment/${appointmentId}`)
            return res.data
        } catch {
            return null
        }
    },
}