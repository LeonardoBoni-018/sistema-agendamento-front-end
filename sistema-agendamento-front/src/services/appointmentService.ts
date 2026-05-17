import api from './api'
import { Appointment, CreateAppointmentRequest, AppointmentStatus } from '@/types/appointment'

export const appointmentService = {
    myAppointments: async (status?: AppointmentStatus, date?: string): Promise<Appointment[]> => {
        const response = await api.get('/v1/appointment/me', { params: { status, date } })
        return response.data
    },

    getById: async (id: number): Promise<Appointment> => {
        const response = await api.get(`/v1/appointment/${id}`)
        return response.data
    },

    getAllAppointments: async (status?: AppointmentStatus, date?: string): Promise<Appointment[]> => {
        const response = await api.get('/v1/appointment/all', { params: { status, date } })
        return response.data
    },

    getByUser: async (userId: number): Promise<Appointment[]> => {
        const response = await api.get(`/v1/appointment/user/${userId}`)
        return response.data
    },

    getAvailableTimes: async (date: string, jobId: number): Promise<string[]> => {
        const response = await api.get('/v1/appointment/available', { params: { date, jobId } })
        return response.data
    },

    create: async (data: CreateAppointmentRequest): Promise<void> => {
        await api.post('/v1/appointment', data)
    },

    cancel: async (id: number): Promise<void> => {
        await api.put(`/v1/appointment/cancel/${id}`)
    },

    updateStatus: async (id: number, status: AppointmentStatus): Promise<void> => {
        await api.put(`/v1/appointment/status/${id}`, null, { params: { status } })
    },
}