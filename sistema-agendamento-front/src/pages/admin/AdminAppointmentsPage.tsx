import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { appointmentService } from '@/services/appointmentService'
import { Appointment, AppointmentStatus } from '@/types/appointment'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const FILTERS = [
    { value: '', label: 'Todos' },
    { value: 'PENDING', label: 'Pendentes' },
    { value: 'CONFIRMED', label: 'Confirmados' },
    { value: 'CANCELED', label: 'Cancelados' },
    { value: 'FINISHED', label: 'Finalizados' },
]

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'FINISHED', label: 'Finalizado' },
]

export function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<AppointmentStatus | ''>('')

    const load = async () => {
        setLoading(true)
        try {
            const data = await appointmentService.getAllAppointments(filter || undefined)
            setAppointments(data)
        } catch {
            toast.error('Erro ao carregar agendamentos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [filter])

    const handleStatusUpdate = async (id: number, status: AppointmentStatus) => {
        try {
            await appointmentService.updateStatus(id, status)
            toast.success('Status atualizado')
            load()
        } catch {
            toast.error('Erro ao atualizar status')
        }
    }

    return (
        <div style={{ maxWidth: 1000 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {FILTERS.map(f => (
                    <button key={f.value} onClick={() => setFilter(f.value as AppointmentStatus | '')} style={{
                        padding: '6px 14px', borderRadius: 20,
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                        background: filter === f.value ? 'var(--text)' : 'var(--bg-card)',
                        color: filter === f.value ? 'white' : 'var(--text-muted)',
                        border: `1px solid ${filter === f.value ? 'var(--text)' : 'var(--border)'}`,
                        transition: 'all 0.15s',
                    }}>
                        {f.label}
                    </button>
                ))}
            </div>

            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: 20 }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{
                                height: 56, background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                            }} />
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                            Nenhum agendamento encontrado
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1.5fr 1fr 80px 90px 110px 130px',
                            padding: '10px 20px', borderBottom: '1px solid var(--border)',
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                            <span>Cliente</span>
                            <span>Serviço</span>
                            <span>Data</span>
                            <span>Horário</span>
                            <span>Valor</span>
                            <span>Status</span>
                            <span>Alterar status</span>
                        </div>
                        {appointments.map((a, idx) => (
                            <div key={a.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 1.5fr 1fr 80px 90px 110px 130px',
                                padding: '14px 20px', alignItems: 'center',
                                borderBottom: idx < appointments.length - 1 ? '1px solid var(--border)' : 'none',
                                transition: 'background 0.1s',
                            }}
                                 onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                                 onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                    {a.userName}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.jobName}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    {format(parseISO(a.date), "dd MMM yy", { locale: ptBR })}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                                    {a.time?.slice(0, 5)}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                    R$ {Number(a.jobPrice).toFixed(2)}
                                </div>
                                <StatusBadge status={a.status} />
                                <select
                                    value={a.status}
                                    onChange={e => handleStatusUpdate(a.id, e.target.value as AppointmentStatus)}
                                    style={{
                                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)', padding: '5px 8px',
                                        fontSize: 12, color: 'var(--text)', outline: 'none', cursor: 'pointer',
                                        width: '100%',
                                    }}
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}