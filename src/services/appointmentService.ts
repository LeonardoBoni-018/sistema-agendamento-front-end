import api from './api'
import {
    Appointment,
    CreateAppointmentRequest,
    AppointmentStatus,
} from '@/types/appointment'

export const appointmentService = {
    myAppointments: async (
        status?: AppointmentStatus,
        date?: string
    ): Promise<Appointment[]> => {
        const res = await api.get('/v1/appointment/me', { params: { status, date } })
        return res.data
    },

    getById: async (id: number): Promise<Appointment> => {
        const res = await api.get(`/v1/appointment/${id}`)
        return res.data
    },

    getAllAppointments: async (
        status?: AppointmentStatus,
        date?: string
    ): Promise<Appointment[]> => {
        const res = await api.get('/v1/appointment/all', { params: { status, date } })
        return res.data
    },

    getByUser: async (userId: number): Promise<Appointment[]> => {
        const res = await api.get(`/v1/appointment/user/${userId}`)
        return res.data
    },

    getAvailableTimes: async (
        date: string,
        jobId: number
    ): Promise<string[]> => {
        const res = await api.get('/v1/appointment/available', {
            params: { date, jobId },
        })
        return res.data
    },

    create: async (data: CreateAppointmentRequest): Promise<void> => {
        await api.post('/v1/appointment', data)
    },

    reagendar: async (
        id: number,
        novaData: string,
        novoHorario: string
    ): Promise<void> => {
        await api.put(`/v1/appointment/reagendar/${id}`, {
            novaData,
            novoHorario,
        })
    },

    cancel: async (id: number): Promise<void> => {
        await api.put(`/v1/appointment/cancel/${id}`)
    },

    updateStatus: async (
        id: number,
        status: AppointmentStatus
    ): Promise<void> => {
        await api.put(`/v1/appointment/status/${id}`, null, { params: { status } })
    },
}