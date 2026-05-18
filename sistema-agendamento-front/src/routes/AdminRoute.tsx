import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function AdminRoute() {
    const isAdmin = useAuthStore((state) => state.isAdmin)
    return isAdmin() ? <Outlet /> : <Navigate to="/dashboard" replace />
}