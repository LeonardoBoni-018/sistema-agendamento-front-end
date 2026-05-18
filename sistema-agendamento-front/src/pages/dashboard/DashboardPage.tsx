import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'
import { appointmentService } from '@/services/appointmentService'
import { Appointment } from '@/types/appointment'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function StatCard({
                      title, value, icon, color,
                  }: {
    title: string
    value: number
    icon: React.ReactNode
    color: string
}) {
    return (
        <div className="bg-[#0f1117] border border-white/5 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className="text-white text-2xl font-semibold">{value}</p>
            </div>
        </div>
    )
}

export function DashboardPage() {
    const { isAdmin, user } = useAuthStore()
    const admin = isAdmin()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = admin
            ? appointmentService.getAllAppointments()
            : appointmentService.myAppointments()

        load.then(setAppointments).finally(() => setLoading(false))
    }, [admin])

    const pending = appointments.filter(a => a.status === 'PENDING').length
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
    const canceled = appointments.filter(a => a.status === 'CANCELED').length
    const finished = appointments.filter(a => a.status === 'FINISHED').length

    const upcoming = appointments
        .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
        .slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Saudação */}
            <div>
                <h2 className="text-white text-lg font-semibold">
                    Olá, {user?.name?.split(' ')[0]} 👋
                </h2>
                <p className="text-gray-500 text-sm">
                    {admin
                        ? `Visão geral do comércio ${user?.comercioNome}`
                        : `Seus agendamentos em ${user?.comercioNome}`}
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total"
                    value={appointments.length}
                    icon={<Calendar size={22} className="text-cyan-400" />}
                    color="bg-cyan-500/10"
                />
                <StatCard
                    title="Confirmados"
                    value={confirmed}
                    icon={<CheckCircle size={22} className="text-green-400" />}
                    color="bg-green-500/10"
                />
                <StatCard
                    title="Pendentes"
                    value={pending}
                    icon={<Clock size={22} className="text-yellow-400" />}
                    color="bg-yellow-500/10"
                />
                <StatCard
                    title="Cancelados"
                    value={canceled}
                    icon={<XCircle size={22} className="text-red-400" />}
                    color="bg-red-500/10"
                />
            </div>

            {/* Tabela próximos */}
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">
                    {admin ? 'Próximos Agendamentos do Comércio' : 'Meus Próximos Agendamentos'}
                </h2>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : upcoming.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum agendamento próximo.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-gray-500 border-b border-white/5">
                                {admin && <th className="text-left pb-3 font-medium">Cliente</th>}
                                <th className="text-left pb-3 font-medium">Serviço</th>
                                <th className="text-left pb-3 font-medium">Data</th>
                                <th className="text-left pb-3 font-medium">Horário</th>
                                <th className="text-left pb-3 font-medium">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                            {upcoming.map((a) => (
                                <tr key={a.id}>
                                    {admin && (
                                        <td className="py-3 text-gray-400">{a.userName}</td>
                                    )}
                                    <td className="py-3 text-white">{a.jobName}</td>
                                    <td className="py-3 text-gray-400">
                                        {format(new Date(a.date), 'dd MMM yyyy', { locale: ptBR })}
                                    </td>
                                    <td className="py-3 text-gray-400">{a.time}</td>
                                    <td className="py-3">
                                        <StatusBadge status={a.status} />
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Resumo */}
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">Resumo</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {[
                        { label: 'Total', value: appointments.length, color: 'text-white' },
                        { label: 'Finalizados', value: finished, color: 'text-green-400' },
                        { label: 'Pendentes', value: pending, color: 'text-yellow-400' },
                        { label: 'Cancelados', value: canceled, color: 'text-red-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white/5 rounded-xl p-4">
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            <p className="text-gray-500 text-xs mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}