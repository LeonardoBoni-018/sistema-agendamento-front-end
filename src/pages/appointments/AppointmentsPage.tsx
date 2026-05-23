import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { appointmentService } from '@/services/appointmentService'
import { Appointment, AppointmentStatus } from '@/types/appointment'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AvaliacaoModal } from '@/components/shared/AvaliacaoModal'
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments'
import { useAuthStore } from '@/store/authStore'
import { jobService } from '@/services/jobService'
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
    const { user } = useAuthStore()
    const [allData, setAllData] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<AppointmentStatus | ''>('')
    const [reagendando, setReagendando] = useState<Appointment | null>(null)
    const [avaliando, setAvaliando] = useState<Appointment | null>(null)
    const [novaData, setNovaData] = useState('')
    const [availableTimes, setAvailableTimes] = useState<string[]>([])
    const [loadingTimes, setLoadingTimes] = useState(false)
    const [novoHorario, setNovoHorario] = useState('')

    const { appointments, setAppointments } = useRealtimeAppointments(allData, {
        filterUserId: user?.id,
    })

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const data = await appointmentService.myAppointments()
            setAllData(data)
        } catch {
            toast.error('Erro ao carregar agendamentos')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])
    useEffect(() => { jobService.getAll() }, [])

    useEffect(() => {
        if (reagendando && novaData) {
            setLoadingTimes(true)
            setNovoHorario('')
            appointmentService
                .getAvailableTimes(novaData, reagendando.jobId)
                .then(setAvailableTimes)
                .finally(() => setLoadingTimes(false))
        }
    }, [novaData, reagendando?.id])

    const handleCancel = async (id: number) => {
        try {
            await appointmentService.cancel(id)
        } catch {
            toast.error('Erro ao cancelar')
        }
    }

    const handleReagendar = async () => {
        if (!reagendando || !novaData || !novoHorario) {
            toast.error('Selecione data e horário')
            return
        }
        try {
            await appointmentService.reagendar(reagendando.id, novaData, novoHorario)
            toast.success('Reagendado!')
            setReagendando(null)
        } catch {
            toast.error('Erro ao reagendar')
        }
    }

    // ✅ Atualiza jaAvaliou localmente após avaliar
    const handleAvaliacaoSuccess = () => {
        if (!avaliando) return
        setAppointments(prev =>
            prev.map(a =>
                a.id === avaliando.id ? { ...a, jaAvaliou: true } : a
            )
        )
    }

    const displayed = filter
        ? appointments.filter(a => a.status === filter)
        : appointments

    const inputStyle = {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '8px 10px',
        fontSize: 13, color: 'var(--text)', outline: 'none',
    }

    return (
        <div style={{ maxWidth: 900 }}>
            {avaliando && (
                <AvaliacaoModal
                    appointment={avaliando}
                    onClose={() => setAvaliando(null)}
                    onSuccess={handleAvaliacaoSuccess}
                />
            )}

            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 20, gap: 12,
            }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value as AppointmentStatus | '')}
                            style={{
                                padding: '6px 14px', borderRadius: 20,
                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                background: filter === f.value ? 'var(--text)' : 'var(--bg-card)',
                                color: filter === f.value ? 'white' : 'var(--text-muted)',
                                border: `1px solid ${filter === f.value ? 'var(--text)' : 'var(--border)'}`,
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <button onClick={() => navigate('/appointments/new')} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--text)', color: 'white',
                    fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>
                    <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} />
                    Novo agendamento
                </button>
            </div>

            {reagendando && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px',
                    marginBottom: 16, borderLeft: '3px solid var(--accent)',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 14,
                    }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                                Reagendar — {reagendando.jobName}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                                Atual: {format(parseISO(reagendando.date), "dd/MM/yyyy", { locale: ptBR })} às {reagendando.time?.slice(0, 5)}
                            </div>
                        </div>
                        <button onClick={() => setReagendando(null)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: 18,
                        }}>
                            <i className="ti ti-x" aria-hidden="true" />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{
                                fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                                Nova data
                            </label>
                            <input
                                type="date"
                                value={novaData}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setNovaData(e.target.value)}
                                style={{ ...inputStyle, width: 160 }}
                            />
                        </div>
                        {novaData && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{
                                    fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>
                                    Novo horário
                                </label>
                                {loadingTimes ? (
                                    <div style={{ fontSize: 12, color: 'var(--text-faint)', padding: '8px 0' }}>
                                        Carregando...
                                    </div>
                                ) : availableTimes.length === 0 ? (
                                    <div style={{ fontSize: 12, color: 'var(--text-faint)', padding: '8px 0' }}>
                                        Nenhum horário disponível
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {availableTimes.map(t => (
                                            <button key={t} onClick={() => setNovoHorario(t)} style={{
                                                padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                                background: novoHorario === t ? 'var(--text)' : 'var(--bg-surface)',
                                                color: novoHorario === t ? 'white' : 'var(--text-muted)',
                                                border: `1px solid ${novoHorario === t ? 'var(--text)' : 'var(--border)'}`,
                                            }}>
                                                {t?.slice(0, 5)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {novaData && novoHorario && (
                            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                                <button onClick={handleReagendar} style={{
                                    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                                    background: 'var(--success)', color: 'white',
                                    fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                                }}>
                                    Confirmar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🗓</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                            Nenhum agendamento encontrado
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
                            gridTemplateColumns: '2fr 1fr 80px 90px 100px 150px',
                            padding: '10px 20px', borderBottom: '1px solid var(--border)',
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                            <span>Serviço</span><span>Data</span><span>Horário</span>
                            <span>Valor</span><span>Status</span><span>Ações</span>
                        </div>
                        {displayed.map((a, idx) => (
                            <div key={a.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 80px 90px 100px 150px',
                                padding: '14px 20px', alignItems: 'center',
                                borderBottom: idx < displayed.length - 1
                                    ? '1px solid var(--border)' : 'none',
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
                                <div style={{
                                    fontSize: 13, color: 'var(--text-muted)',
                                    fontVariantNumeric: 'tabular-nums',
                                }}>
                                    {a.time?.slice(0, 5)}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                    R$ {Number(a.jobPrice).toFixed(2)}
                                </div>
                                <StatusBadge status={a.status} />
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                    {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                                        <>
                                            <button
                                                onClick={() => { setReagendando(a); setNovaData(''); setNovoHorario('') }}
                                                style={{
                                                    fontSize: 11, fontWeight: 600,
                                                    color: 'var(--accent-dark)',
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                }}
                                            >
                                                Reagendar
                                            </button>
                                            <button
                                                onClick={() => handleCancel(a.id)}
                                                style={{
                                                    fontSize: 11, fontWeight: 600, color: 'var(--danger)',
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                }}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                    {/* ✅ Botão de avaliação para finalizados */}
                                    {a.status === 'FINISHED' && !a.jaAvaliou && (
                                        <button
                                            onClick={() => setAvaliando(a)}
                                            style={{
                                                fontSize: 11, fontWeight: 600,
                                                color: '#F59E0B',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 3,
                                            }}
                                        >
                                            ★ Avaliar
                                        </button>
                                    )}
                                    {a.status === 'FINISHED' && a.jaAvaliou && (
                                        <span style={{
                                            fontSize: 11, color: 'var(--text-faint)',
                                        }}>
                      ★ Avaliado
                    </span>
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