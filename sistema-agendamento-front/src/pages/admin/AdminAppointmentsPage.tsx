import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { appointmentService } from '@/services/appointmentService'
import { Appointment, AppointmentStatus } from '@/types/appointment'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'FINISHED', label: 'Finalizado' },
]

export function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<AppointmentStatus | ''>('')

    const load = async () => {
        setLoading(true)
        try {
            const data = await appointmentService.getAllAppointments(
                filterStatus || undefined
            )
            setAppointments(data)
        } catch {
            toast.error('Erro ao carregar agendamentos!')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [filterStatus])

    const handleStatusUpdate = async (
        id: number,
        status: AppointmentStatus
    ) => {
        try {
            await appointmentService.updateStatus(id, status)
            toast.success('Status atualizado!')
            load()
        } catch {
            toast.error('Erro ao atualizar status!')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFilterStatus('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === ''
                            ? 'bg-cyan-500 text-black'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                >
                    Todos
                </button>
                {STATUS_OPTIONS.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => setFilterStatus(s.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            filterStatus === s.value
                                ? 'bg-cyan-500 text-black'
                                : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <div className="bg-[#0f1117] border border-white/5 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Nenhum agendamento encontrado.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/5">
                        <tr className="text-gray-500">
                            <th className="text-left p-4 font-medium">Cliente</th>
                            <th className="text-left p-4 font-medium">Serviço</th>
                            <th className="text-left p-4 font-medium">Data</th>
                            <th className="text-left p-4 font-medium">Horário</th>
                            <th className="text-left p-4 font-medium">Valor</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {appointments.map((a) => (
                            <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 text-white font-medium">{a.userName}</td>
                                <td className="p-4 text-gray-400">{a.jobName}</td>
                                <td className="p-4 text-gray-400">
                                    {format(new Date(a.date), 'dd MMM yyyy', { locale: ptBR })}
                                </td>
                                <td className="p-4 text-gray-400">{a.time}</td>
                                <td className="p-4 text-gray-400">
                                    R$ {Number(a.jobPrice).toFixed(2)}
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={a.status} />
                                </td>
                                <td className="p-4">
                                    <select
                                        value={a.status}
                                        onChange={(e) =>
                                            handleStatusUpdate(a.id, e.target.value as AppointmentStatus)
                                        }
                                        className="bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s.value} value={s.value} className="bg-[#0f1117]">
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}