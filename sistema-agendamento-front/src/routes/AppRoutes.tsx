import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { AdminRoute } from './AdminRoute'
import { DashboardLayout } from 'src/components/layout/DashboardLayout'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const AgendamentoPublicoPage = lazy(() => import('@/pages/publico/AgendamentoPublicoPage').then(m => ({ default: m.AgendamentoPublicoPage })))
const PagamentoRetornoPage = lazy(() => import('@/pages/pagamento/PagamentoRetornoPage').then(m => ({ default: m.PagamentoRetornoPage })))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AppointmentsPage = lazy(() => import('@/pages/appointments/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })))
const NewAppointmentPage = lazy(() => import('@/pages/appointments/NewAppointmentPage').then(m => ({ default: m.NewAppointmentPage })))
const FilaPage = lazy(() => import('@/pages/fila/FilaPage').then(m => ({ default: m.FilaPage })))
const JobsPage = lazy(() => import('@/pages/jobs/JobsPage').then(m => ({ default: m.JobsPage })))
const AdminAppointmentsPage = lazy(() => import('@/pages/admin/AdminAppointmentsPage').then(m => ({ default: m.AdminAppointmentsPage })))
const FilaAdminPage = lazy(() => import('@/pages/admin/FilaAdminPage').then(m => ({ default: m.FilaAdminPage })))
const ClientesPage = lazy(() => import('@/pages/admin/ClientesPage').then(m => ({ default: m.ClientesPage })))
const AvaliacoesPage = lazy(() => import('@/pages/admin/AvaliacoesPage').then(m => ({ default: m.AvaliacoesPage })))
const ConfiguracaoPage = lazy(() => import('@/pages/admin/ConfiguracaoPage').then(m => ({ default: m.ConfiguracaoPage })))
const FuncionariosPage = lazy(() => import('@/pages/admin/FuncionariosPage').then(m => ({ default: m.FuncionariosPage })))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))

function Fallback() {
    return (
        <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 22, height: 22, border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
    )
}

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Suspense fallback={<Fallback />}>
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
            </Suspense>
        </BrowserRouter>
    )
}