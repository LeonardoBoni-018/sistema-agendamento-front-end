import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { API_URL } from '@/config'

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
})

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

let refreshing: Promise<string> | null = null

// Renova o access token uma única vez, mesmo com várias requisições concorrentes
function refreshAccessToken(): Promise<string> {
    if (!refreshing) {
        const { refreshToken, setAuth } = useAuthStore.getState()
        if (!refreshToken) return Promise.reject(new Error('no refresh token'))

        refreshing = axios
            .post(`${API_URL}/v1/auth/refresh`, null, { params: { refreshToken } })
            .then((res) => {
                setAuth(res.data.accessToken, res.data.refreshToken)
                return res.data.accessToken as string
            })
            .finally(() => { refreshing = null })
    }
    return refreshing
}

const AUTH_PATHS = ['/v1/auth/login', '/v1/auth/register', '/v1/auth/refresh']

function forceLogout() {
    useAuthStore.getState().logout()
    if (window.location.pathname !== '/login') window.location.href = '/login'
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
        const isAuthCall = AUTH_PATHS.some((p) => original?.url?.startsWith(p))

        if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
            original._retry = true
            try {
                const token = await refreshAccessToken()
                original.headers.Authorization = `Bearer ${token}`
                return api(original)
            } catch {
                forceLogout()
            }
        }
        return Promise.reject(error)
    }
)

export default api
