import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { appointmentService } from '@/services/appointmentService'
import { Appointment, AppointmentStatus } from '@/types/appointment'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function AppointmentsPage() {
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<AppointmentStatus | ''>('')

    const load = async () => {
        setLoading(true)
        try {
            const data = await appointmentService.myAppointments(
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

    const handleCancel = async (id: number) => {
        try {
            await appointmentService.cancel(id)
            toast.success('Agendamento cancelado!')
            load()
        } catch {
            toast.error('Erro ao cancelar agendamento!')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {(['', 'PENDING', 'CONFIRMED', 'CANCELED', 'FINISHED'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                filterStatus === s
                                    ? 'bg-cyan-500 text-black'
                                    : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                        >
                            {s === '' ? 'Todos' : s === 'PENDING' ? 'Pendentes'
                                : s === 'CONFIRMED' ? 'Confirmados'
                                    : s === 'CANCELED' ? 'Cancelados' : 'Finalizados'}
                        </button>
                    ))}
                </div>
                <Button
                    onClick={() => navigate('/appointments/new')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                >
                    <Plus size={16} className="mr-2" />
                    Novo Agendamento
                </Button>
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
                        <Button
                            onClick={() => navigate('/appointments/new')}
                            className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                        >
                            Criar primeiro agendamento
                        </Button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-white/5">
                        <tr className="text-gray-500">
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
                                <td className="p-4 text-white font-medium">{a.jobName}</td>
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
                                    {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                                        <button
                                            onClick={() => handleCancel(a.id)}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    )}
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