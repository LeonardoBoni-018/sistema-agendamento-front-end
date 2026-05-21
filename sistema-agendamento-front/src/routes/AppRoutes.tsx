import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AdminRoute } from './AdminRoute'
import { DashboardLayout } from 'src/components/layout/DashboardLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage'
import { NewAppointmentPage } from '@/pages/appointments/NewAppointmentPage'
import { JobsPage } from '@/pages/jobs/JobsPage'
import { AdminAppointmentsPage } from '@/pages/admin/AdminAppointmentsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import {ConfiguracaoPage} from "@/pages/admin/ConfiguracaoPage.tsx";
import { ClientesPage } from '@/pages/admin/ClientesPage'
import { AvaliacoesPage } from '@/pages/admin/AvaliacoesPage'

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<PrivateRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/appointments" element={<AppointmentsPage />} />
                        <Route path="/appointments/new" element={<NewAppointmentPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        <Route element={<AdminRoute />}>
                            <Route path="/jobs" element={<JobsPage />} />
                            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
                            <Route path="/admin/clientes" element={<ClientesPage />} />
                            <Route path="/admin/avaliacoes" element={<AvaliacoesPage />} />
                            <Route path="/admin/configuracao" element={<ConfiguracaoPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    )
}