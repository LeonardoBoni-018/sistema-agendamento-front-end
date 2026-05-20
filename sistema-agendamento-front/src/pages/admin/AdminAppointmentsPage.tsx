import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { appointmentService } from '@/services/appointmentService'
import { Appointment, AppointmentStatus } from '@/types/appointment'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as Dialog from '@/components/ui/dialog'

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
    const [rawData, setRawData] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<AppointmentStatus | ''>('')
    const [confirmingStatus, setConfirmingStatus] = useState<{appointment: Appointment; status: AppointmentStatus} | null>(null)

    // ✅ Admin vê todos — sem filtro por userId
    const { appointments } = useRealtimeAppointments(rawData, { isAdmin: true })

    const load = async () => {
        setLoading(true)
        try {
            const data = await appointmentService.getAllAppointments(filter || undefined)
            setRawData(data)
        } catch {
            toast.error('Erro ao carregar agendamentos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [filter])

    const handleStatusUpdate = (appointment: Appointment, newStatus: AppointmentStatus) => {
        if (appointment.status === newStatus) return

        if (newStatus === 'CANCELED' || newStatus === 'FINISHED') {
            setConfirmingStatus({ appointment, status: newStatus })
        } else {
            executeStatusUpdate(appointment.id, newStatus)
        }
    }

    const executeStatusUpdate = async (id: number, status: AppointmentStatus) => {
        try {
            await appointmentService.updateStatus(id, status)
        } catch {
            toast.error('Erro ao atualizar status')
        }
    }

    const displayed = filter
        ? appointments.filter(a => a.status === filter)
        : appointments

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
                    }}>
                        {f.label}
                    </button>
                ))}
                <div style={{
                    marginLeft: 'auto', fontSize: 12, color: 'var(--text-faint)',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
          <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--success)', display: 'inline-block',
          }} />
                    Atualizando em tempo real
                </div>
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
                ) : displayed.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
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
                            <span>Cliente</span><span>Serviço</span><span>Data</span>
                            <span>Hora</span><span>Valor</span><span>Status</span>
                            <span>Alterar</span>
                        </div>
                        {displayed.map((a, idx) => (
                            <div key={a.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 1.5fr 1fr 80px 90px 110px 130px',
                                padding: '14px 20px', alignItems: 'center',
                                borderBottom: idx < displayed.length - 1 ? '1px solid var(--border)' : 'none',
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
                                    onChange={e => handleStatusUpdate(a, e.target.value as AppointmentStatus)}
                                    style={{
                                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)', padding: '5px 8px',
                                        fontSize: 12, color: 'var(--text)', outline: 'none', cursor: 'pointer',
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

            <Dialog.Dialog open={!!confirmingStatus} onOpenChange={() => setConfirmingStatus(null)}>
                <Dialog.DialogContent style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', maxWidth: 400,
                }}>
                    <Dialog.DialogHeader>
                        <Dialog.DialogTitle style={{
                            fontSize: 16, fontWeight: 600, color: 'var(--text)',
                        }}>
                            {confirmingStatus?.status === 'CANCELED' ? 'Cancelar agendamento?' : 'Finalizar agendamento?'}
                        </Dialog.DialogTitle>
                        <Dialog.DialogDescription style={{
                            fontSize: 13, color: 'var(--text-muted)', marginTop: 4,
                        }}>
                            {confirmingStatus && `Você está prestes a ${confirmingStatus.status === 'CANCELED' ? 'cancelar' : 'finalizar'} o agendamento de ${confirmingStatus.appointment.userName} (${confirmingStatus.appointment.jobName}). Esta ação não pode ser desfeita.`}
                        </Dialog.DialogDescription>
                    </Dialog.DialogHeader>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                        <button onClick={() => setConfirmingStatus(null)} style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            background: 'var(--bg-surface)', color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                        }}>
                            Cancelar
                        </button>
                        <button onClick={() => {
                            if (confirmingStatus) {
                                executeStatusUpdate(confirmingStatus.appointment.id, confirmingStatus.status)
                                setConfirmingStatus(null)
                            }
                        }} style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            background: confirmingStatus?.status === 'CANCELED' ? 'var(--danger)' : 'var(--success)',
                            color: 'white', border: 'none',
                        }}>
                            {confirmingStatus?.status === 'CANCELED' ? 'Sim, cancelar' : 'Sim, finalizar'}
                        </button>
                    </div>
                </Dialog.DialogContent>
            </Dialog.Dialog>
        </div>
    )
}