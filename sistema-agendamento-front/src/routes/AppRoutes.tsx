import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AdminRoute } from './AdminRoute'
import { DashboardLayout } from 'src/components/layout/DashboardLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AgendamentoPublicoPage } from '@/pages/publico/AgendamentoPublicoPage'
import { PagamentoRetornoPage } from '@/pages/pagamento/PagamentoRetornoPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage'
import { NewAppointmentPage } from '@/pages/appointments/NewAppointmentPage'
import { FilaPage } from '@/pages/fila/FilaPage'
import { JobsPage } from '@/pages/jobs/JobsPage'
import { AdminAppointmentsPage } from '@/pages/admin/AdminAppointmentsPage'
import { FilaAdminPage } from '@/pages/admin/FilaAdminPage'
import { ClientesPage } from '@/pages/admin/ClientesPage'
import { AvaliacoesPage } from '@/pages/admin/AvaliacoesPage'
import { ConfiguracaoPage } from '@/pages/admin/ConfiguracaoPage'
import { FuncionariosPage } from '@/pages/admin/FuncionariosPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/agendar/:comercioId" element={<AgendamentoPublicoPage />} />
                <Route path="/pagamento/sucesso" element={<PagamentoRetornoPage />} />
                <Route path="/pagamento/erro" element={<PagamentoRetornoPage />} />
                <Route path="/pagamento/pendente" element={<PagamentoRetornoPage />} />

                {/* Privadas */}
                <Route element={<PrivateRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/appointments" element={<AppointmentsPage />} />
                        <Route path="/appointments/new" element={<NewAppointmentPage />} />
                        <Route path="/fila" element={<FilaPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        <Route element={<AdminRoute />}>
                            <Route path="/jobs" element={<JobsPage />} />
                            <Route path="/admin/funcionarios" element={<FuncionariosPage />} />
                            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
                            <Route path="/admin/fila" element={<FilaAdminPage />} />
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