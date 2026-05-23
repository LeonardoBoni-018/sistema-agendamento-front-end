import api from './api'
import { Comercio } from '@/types/comercio'

export const comercioService = {
    getAll: async (): Promise<Comercio[]> => {
        const response = await api.get('/v1/comercio')
        return response.data
    },

    getById: async (id: number): Promise<Comercio> => {
        const response = await api.get(`/v1/comercio/${id}`)
        return response.data
    },
}