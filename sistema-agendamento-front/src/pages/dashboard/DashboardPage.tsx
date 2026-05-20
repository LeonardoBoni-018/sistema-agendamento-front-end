import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentService } from '@/services/appointmentService'
import { Appointment } from '@/types/appointment'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useAuthStore } from '@/store/authStore'
import { format, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px',
        }}>
            <div style={{ fontSize: 28, fontWeight: 500, color: color ?? 'var(--text)' }}>
                {value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
        </div>
    )
}

export function DashboardPage() {
    const { isAdmin, user } = useAuthStore()
    const navigate = useNavigate()
    const admin = isAdmin()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = admin
            ? appointmentService.getAllAppointments()
            : appointmentService.myAppointments()
        load.then(setAppointments).finally(() => setLoading(false))
    }, [admin])

    const todayAppointments = appointments.filter(a => {
        try { return isToday(parseISO(a.date)) } catch { return false }
    })
    const pending = appointments.filter(a => a.status === 'PENDING').length
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
    const canceled = appointments.filter(a => a.status === 'CANCELED').length

    const upcoming = appointments
        .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
        .slice(0, 6)

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

    return (
        <div style={{ maxWidth: 900 }}>
            <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
                    {greeting}, {user?.name?.split(' ')[0]} ✦
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })} · {user?.comercioNome}
                </div>
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12, marginBottom: 28,
            }}>
                <Stat label="Hoje" value={todayAppointments.length} />
                <Stat label="Confirmados" value={confirmed} color="var(--success)" />
                <Stat label="Pendentes" value={pending} color="var(--pending)" />
                <Stat label="Cancelados" value={canceled} color="var(--danger)" />
            </div>

            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
                <div style={{
                    padding: '16px 20px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                            {admin ? 'Próximos agendamentos' : 'Meus próximos horários'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 1 }}>
                            Pendentes e confirmados
                        </div>
                    </div>
                    {!admin && (
                        <button onClick={() => navigate('/appointments/new')} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--text)', color: 'white',
                            fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                        }}>
                            <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} />
                            Agendar
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ padding: 20 }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{
                                height: 48, background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                                animation: 'pulse 1.5s infinite',
                            }} />
                        ))}
                    </div>
                ) : upcoming.length === 0 ? (
                    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                            Nenhum agendamento próximo
                        </div>
                        {!admin && (
                            <button onClick={() => navigate('/appointments/new')} style={{
                                marginTop: 12, padding: '8px 20px',
                                borderRadius: 'var(--radius-sm)', background: 'var(--text)',
                                color: 'white', fontSize: 13, fontWeight: 600,
                                border: 'none', cursor: 'pointer',
                            }}>
                                Criar agendamento
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        {upcoming.map((a, idx) => (
                            <div key={a.id} style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                padding: '14px 20px',
                                borderBottom: idx < upcoming.length - 1 ? '1px solid var(--border)' : 'none',
                            }}>
                                <div style={{
                                    minWidth: 44, fontSize: 13, fontWeight: 600,
                                    color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums',
                                }}>
                                    {a.time?.slice(0, 5)}
                                </div>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                    background: a.status === 'CONFIRMED' ? 'var(--success)' : 'var(--pending)',
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {admin ? a.userName : a.jobName}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                                        {admin ? a.jobName : format(parseISO(a.date), "dd 'de' MMM", { locale: ptBR })}
                                    </div>
                                </div>
                                <StatusBadge status={a.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}