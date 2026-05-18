import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/auth'

interface AuthState {
    token: string | null
    refreshToken: string | null
    user: User | null
    setAuth: (token: string, refreshToken: string) => void
    setUser: (user: User) => void
    logout: () => void
    isAdmin: () => boolean
    getComercioId: () => number | null
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            refreshToken: null,
            user: null,

            setAuth: (token, refreshToken) => set({ token, refreshToken }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, refreshToken: null, user: null }),

            isAdmin: () => {
                const token = get().token
                if (!token) return false
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    const roles: string[] = payload.roles ?? payload.authorities ?? []
                    return roles.some(r =>
                        r === 'ROLE_ADMIN' || r === 'ADMIN'
                    )
                } catch {
                    return false
                }
            },

            getComercioId: () => {
                return get().user?.comercioId ?? null
            },
        }),
        { name: 'auth-storage' }
    )
)