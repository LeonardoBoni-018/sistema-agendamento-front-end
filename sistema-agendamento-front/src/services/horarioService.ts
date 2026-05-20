import api from './api'
import {
    HorarioFuncionamento,
    HorarioFuncionamentoRequest,
    BloqueioHorario,
    BloqueioHorarioRequest,
} from '@/types/horario'

export const horarioService = {
    getHorarios: async (): Promise<HorarioFuncionamento[]> => {
        const res = await api.get('/v1/horario-funcionamento')
        return res.data
    },

    salvarHorario: async (
        data: HorarioFuncionamentoRequest
    ): Promise<HorarioFuncionamento> => {
        const res = await api.post('/v1/horario-funcionamento', data)
        return res.data
    },

    getBloqueios: async (): Promise<BloqueioHorario[]> => {
        const res = await api.get('/v1/bloqueio')
        return res.data
    },

    criarBloqueio: async (
        data: BloqueioHorarioRequest
    ): Promise<BloqueioHorario> => {
        const res = await api.post('/v1/bloqueio', data)
        return res.data
    },

    deletarBloqueio: async (id: number): Promise<void> => {
        await api.delete(`/v1/bloqueio/${id}`)
    },
}