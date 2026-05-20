import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export function AppointmentsPage() {
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<AppointmentStatus | ''>('')

    const load = async () => {
        setLoading(true)
        try {
            const data = await appointmentService.myAppointments(filter || undefined)
            setAppointments(data)
        } catch {
            toast.error('Erro ao carregar agendamentos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [filter])

    const handleCancel = async (id: number) => {
        try {
            await appointmentService.cancel(id)
            toast.success('Agendamento cancelado')
            load()
        } catch {
            toast.error('Erro ao cancelar')
        }
    }

    return (
        <div style={{ maxWidth: 900 }}>
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 20, gap: 12,
            }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                <button onClick={() => navigate('/appointments/new')} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--text)', color: 'white',
                    fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                    flexShrink: 0,
                }}>
                    <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} />
                    Novo agendamento
                </button>
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
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🗓</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                            Nenhum agendamento encontrado
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                            Que tal criar seu primeiro agendamento?
                        </div>
                        <button onClick={() => navigate('/appointments/new')} style={{
                            padding: '9px 20px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--text)', color: 'white',
                            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                        }}>
                            Criar agendamento
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 80px 90px 110px 80px',
                            padding: '10px 20px', borderBottom: '1px solid var(--border)',
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                            <span>Serviço</span>
                            <span>Data</span>
                            <span>Horário</span>
                            <span>Valor</span>
                            <span>Status</span>
                            <span></span>
                        </div>
                        {appointments.map((a, idx) => (
                            <div key={a.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 80px 90px 110px 80px',
                                padding: '14px 20px', alignItems: 'center',
                                borderBottom: idx < appointments.length - 1 ? '1px solid var(--border)' : 'none',
                                transition: 'background 0.1s',
                            }}
                                 onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                                 onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                        {a.jobName}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                                        {a.jobDurationMinutes}min
                                    </div>
                                </div>
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
                                <div>
                                    {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                                        <button onClick={() => handleCancel(a.id)} style={{
                                            fontSize: 11, fontWeight: 600, color: 'var(--danger)',
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: '4px 0',
                                        }}>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}