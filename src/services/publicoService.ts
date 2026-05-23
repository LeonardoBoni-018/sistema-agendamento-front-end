import axios from 'axios'
import { ComercioPublico } from '@/types/publico'
import { AgendamentoPublicoRequest } from '@/types/publico'

const publicApi = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' },
})

export const publicoService = {
    getComercio: async (comercioId: number): Promise<ComercioPublico> => {
        const res = await publicApi.get(`/v1/publico/comercio/${comercioId}`)
        return res.data
    },

    getHorarios: async (
        comercioId: number,
        date: string,
        jobId: number,
        funcionarioId?: number
    ): Promise<string[]> => {
        const res = await publicApi.get(
            `/v1/publico/comercio/${comercioId}/horarios`,
            { params: { date, jobId, funcionarioId } }
        )
        return res.data
    },

    agendar: async (
        comercioId: number,
        data: AgendamentoPublicoRequest
    ): Promise<void> => {
        await publicApi.post(
            `/v1/publico/comercio/${comercioId}/agendar`,
            data
        )
    },
}