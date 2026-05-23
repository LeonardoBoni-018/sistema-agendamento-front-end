import api from './api'
import { User } from '@/types/auth'

export interface UpdateProfileRequest {
    name?: string
    phone?: string
}

export const userService = {
    getMyProfile: async (): Promise<User> => {
        const response = await api.get('/v1/user/me')
        return response.data
    },

    updateMyProfile: async (data: UpdateProfileRequest): Promise<void> => {
        await api.put('/v1/user/me', data)
    },
}