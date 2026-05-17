import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function PrivateRoute() {
    const token = useAuthStore((state) => state.token)
    return token ? <Outlet /> : <Navigate to="/login" replace />
}