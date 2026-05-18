import api from './api'
import { LoginRequest, RegisterRequest, TokenResponse } from '@/types/auth'

export const authService = {
    login: async (data: LoginRequest): Promise<TokenResponse> => {
        const response = await api.post('/v1/auth/login', data)
        return response.data
    },

    register: async (data: RegisterRequest): Promise<void> => {
        await api.post('/v1/auth/register', data)
    },

    logout: async (): Promise<void> => {
        await api.post('/v1/auth/logout')
    },

    refresh: async (refreshToken: string): Promise<TokenResponse> => {
        const response = await api.post(
            `/v1/auth/refresh?refreshToken=${refreshToken}`
        )
        return response.data
    },
}