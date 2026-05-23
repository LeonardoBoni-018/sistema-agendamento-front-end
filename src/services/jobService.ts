import api from './api'
import { Job, CreateJobRequest, UpdateJobRequest } from '@/types/job'

export const jobService = {
    getAll: async (): Promise<Job[]> => {
        const response = await api.get('/v1/job')
        return response.data
    },

    getById: async (id: number): Promise<Job> => {
        const response = await api.get(`/v1/job/${id}`)
        return response.data
    },

    create: async (data: CreateJobRequest): Promise<void> => {
        await api.post('/v1/job', data)
    },

    update: async (id: number, data: UpdateJobRequest): Promise<void> => {
        await api.put(`/v1/job/${id}`, data)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/v1/job/${id}`)
    },
}