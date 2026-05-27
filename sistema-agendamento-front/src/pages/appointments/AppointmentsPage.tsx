import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { appointmentService } from '@/services/appointmentService'
import { filaService } from '@/services/filaService'
import { Appointment, AppointmentStatus } from '@/types/appointment'
import { FilaEspera } from '@/types/fila'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AvaliacaoModal } from '@/components/shared/AvaliacaoModal'
import { PagamentoCard } from '@/components/shared/PagamentoCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments'
import { useAuthStore } from '@/store/authStore'
import { jobService } from '@/services/jobService'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const FILTERS: { value: AppointmentStatus | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'PENDING', label: 'Pendentes' },
    { value: 'CONFIRMED', label: 'Confirmados' },
    { value: 'CANCELED', label: 'Cancelados' },
    { value: 'FINISHED', label: 'Finalizados' },
]

function formatDate(dateStr: string) {
    try {
        const d = parseISO(dateStr)
        if (isToday(d)) return 'Hoje'
        if (isTomorrow(d)) return 'Amanhã'
        return format(d, "dd 'de' MMM", { locale: ptBR })
    } catch { return dateStr }
}

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
    const [filas, setFilas] = useState<FilaEspera[]>([])
    const [expandedPayment, setExpandedPayment] = useState<number | null>(null)

    const { appointments, setAppointments } = useRealtimeAppointments(allData, {
        filterUserId: user?.id,
        onFilaVaga: () => filaService.minhaFila().then(setFilas),
    })

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [data, fila] = await Promise.all([
                appointmentService.myAppointments(),
                filaService.minhaFila(),
            ])
            setAllData(data)
            setFilas(fila)
        } catch {
            toast.error('Erro ao carregar dados')
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
        try { await appointmentService.cancel(id) }
        catch { toast.error('Erro ao cancelar') }
    }

    const handleReagendar = async () => {
        if (!reagendando || !novaData || !novoHorario) return
        try {
            await appointmentService.reagendar(reagendando.id, novaData, novoHorario)
            toast.success('Reagendado com sucesso!')
            setReagendando(null)
        } catch { toast.error('Erro ao reagendar') }
    }

    const handleAvaliacaoSuccess = () => {
        if (!avaliando) return
        setAppointments(prev =>
            prev.map(a => a.id === avaliando.id ? { ...a, jaAvaliou: true } : a)
        )
    }

    const displayed = filter
        ? appointments.filter(a => a.status === filter)
        : appointments

    const inputStyle: React.CSSProperties = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontSize: 13, color: 'var(--text)',
        fontFamily: 'var(--font)', outline: 'none',
        transition: 'border-color var(--transition)',
        boxShadow: 'var(--shadow-sm)',
    }

    return (
        <div style={{ maxWidth: 960 }}>
            {avaliando && (
                <AvaliacaoModal
                    appointment={avaliando}
                    onClose={() => setAvaliando(null)}
                    onSuccess={handleAvaliacaoSuccess}
                />
            )}

            {/* Fila de espera banner */}
            {filas.length > 0 && (
                <div style={{
                    background: 'var(--warning-light)',
                    border: '1px solid #FDE68A',
                    borderRadius: 'var(--radius)',
                    padding: '12px 16px',
                    marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 10,
                    animation: 'slideInRight 0.3s ease both',
                }}>
                    <span style={{ fontSize: 16 }}>⏳</span>
                    <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-dark)' }}>
              {filas.length} fila{filas.length > 1 ? 's' : ''} de espera ativa{filas.length > 1 ? 's' : ''}
            </span>
                        <span style={{ fontSize: 12, color: 'var(--accent)', marginLeft: 6 }}>
              Você será notificado ao abrir uma vaga
            </span>
                    </div>
                    <Button variant="warning" size="sm" onClick={() => navigate('/fila')}>
                        Ver fila
                    </Button>
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 16, gap: 12,
            }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            style={{
                                padding: '5px 12px', borderRadius: 100,
                                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                background: filter === f.value ? 'var(--text)' : 'var(--bg-card)',
                                color: filter === f.value ? 'white' : 'var(--text-secondary)',
                                border: `1px solid ${filter === f.value ? 'var(--text)' : 'var(--border)'}`,
                                transition: 'all var(--transition)',
                                fontFamily: 'var(--font)',
                            }}
                            onMouseEnter={e => {
                                if (filter !== f.value) {
                                    e.currentTarget.style.borderColor = 'var(--border-strong)'
                                    e.currentTarget.style.color = 'var(--text)'
                                }
                            }}
                            onMouseLeave={e => {
                                if (filter !== f.value) {
                                    e.currentTarget.style.borderColor = 'var(--border)'
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                }
                            }}
                        >
                            {f.label}
                            {f.value && (
                                <span style={{
                                    marginLeft: 5, fontSize: 10, fontWeight: 700,
                                    opacity: 0.6,
                                }}>
                  {appointments.filter(a => a.status === f.value).length}
                </span>
                            )}
                        </button>
                    ))}
                </div>
                <Button
                    onClick={() => navigate('/appointments/new')}
                    icon={
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2.5}>
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    }
                >
                    Novo agendamento
                </Button>
            </div>

            {/* Reagendamento */}
            {reagendando && (
                <Card style={{
                    marginBottom: 16,
                    borderColor: 'var(--accent)',
                    borderLeft: '3px solid var(--accent)',
                    animation: 'fadeInScale 0.2s ease both',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 14,
                    }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                Reagendar — {reagendando.jobName}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                Atual: {formatDate(reagendando.date)} às {reagendando.time?.slice(0, 5)}
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setReagendando(null)}>
                            ✕
                        </Button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{
                                fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5,
                            }}>
                                Nova data
                            </div>
                            <input
                                type="date"
                                value={novaData}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setNovaData(e.target.value)}
                                style={{ ...inputStyle, width: 160 }}
                                onFocus={e => e.target.style.borderColor = 'var(--text)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>
                        {novaData && (
                            <div>
                                <div style={{
                                    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5,
                                }}>
                                    Novo horário
                                </div>
                                {loadingTimes ? (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="skeleton" style={{ width: 60, height: 32 }} />
                                        ))}
                                    </div>
                                ) : availableTimes.length === 0 ? (
                                    <Badge variant="muted">Nenhum horário disponível</Badge>
                                ) : (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {availableTimes.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setNovoHorario(t)}
                                                style={{
                                                    padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                    background: novoHorario === t ? 'var(--text)' : 'var(--bg-surface)',
                                                    color: novoHorario === t ? 'white' : 'var(--text-secondary)',
                                                    border: `1px solid ${novoHorario === t ? 'var(--text)' : 'var(--border)'}`,
                                                    transition: 'all var(--transition)',
                                                    fontFamily: 'var(--font-mono)',
                                                }}
                                            >
                                                {t?.slice(0, 5)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {novaData && novoHorario && (
                            <div style={{ alignSelf: 'flex-end' }}>
                                <Button onClick={handleReagendar} variant="primary">
                                    Confirmar reagendamento
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Table */}
            <Card padding={0} style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: 52 }} />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div style={{ padding: '64px 20px', textAlign: 'center' }}>
                        <div style={{
                            width: 48, height: 48, background: 'var(--bg-surface)',
                            borderRadius: 12, margin: '0 auto 14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"
                                 stroke="var(--text-muted)" strokeWidth={1.5}>
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                            Nenhum agendamento
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                            {filter ? `Nenhum agendamento ${FILTERS.find(f => f.value === filter)?.label.toLowerCase()}` : 'Você ainda não fez nenhum agendamento'}
                        </p>
                        <Button onClick={() => navigate('/appointments/new')}>
                            Criar primeiro agendamento
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Table header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 100px 72px 90px 110px 140px',
                            padding: '9px 20px',
                            borderBottom: '1px solid var(--border)',
                            background: 'var(--bg-surface)',
                        }}>
                            {['Serviço', 'Data', 'Hora', 'Valor', 'Status', 'Ações'].map(h => (
                                <span key={h} style={{
                                    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>
                  {h}
                </span>
                            ))}
                        </div>

                        {displayed.map((a) => (
                            <div key={a.id}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 100px 72px 90px 110px 140px',
                                        padding: '13px 20px', alignItems: 'center',
                                        borderBottom: '1px solid var(--border)',
                                        transition: 'background var(--transition)',
                                        cursor: 'default',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div>
                                        <div style={{
                                            fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                            letterSpacing: '-0.01em',
                                        }}>
                                            {a.jobName}
                                        </div>
                                        {a.funcionarioNome && (
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                                {a.funcionarioNome} · {a.jobDurationMinutes}min
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
                                    }}>
                                        {formatDate(a.date)}
                                    </div>
                                    <div style={{
                                        fontSize: 12, color: 'var(--text-secondary)',
                                        fontFamily: 'var(--font-mono)',
                                    }}>
                                        {a.time?.slice(0, 5)}
                                    </div>
                                    <div style={{
                                        fontSize: 13, fontWeight: 700, color: 'var(--text)',
                                        letterSpacing: '-0.02em',
                                    }}>
                                        R$ {Number(a.jobPrice).toFixed(2)}
                                    </div>
                                    <StatusBadge status={a.status} />
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                        {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                                            <>
                                                <button
                                                    onClick={() => { setReagendando(a); setNovaData(''); setNovoHorario('') }}
                                                    style={{
                                                        fontSize: 11, fontWeight: 600,
                                                        color: 'var(--text-secondary)',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        padding: '3px 6px', borderRadius: 4,
                                                        transition: 'all var(--transition)',
                                                        fontFamily: 'var(--font)',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = 'var(--bg-surface)'
                                                        e.currentTarget.style.color = 'var(--text)'
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = 'none'
                                                        e.currentTarget.style.color = 'var(--text-secondary)'
                                                    }}
                                                >
                                                    Reagendar
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(a.id)}
                                                    style={{
                                                        fontSize: 11, fontWeight: 600, color: 'var(--danger)',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        padding: '3px 6px', borderRadius: 4,
                                                        transition: 'all var(--transition)',
                                                        fontFamily: 'var(--font)',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => setExpandedPayment(expandedPayment === a.id ? null : a.id)}
                                                    style={{
                                                        fontSize: 11, color: 'var(--info)',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        padding: '3px', borderRadius: 4,
                                                        transition: 'all var(--transition)',
                                                    }}
                                                    data-tooltip="Pagamento"
                                                >
                                                    💳
                                                </button>
                                            </>
                                        )}
                                        {a.status === 'FINISHED' && !a.jaAvaliou && (
                                            <button
                                                onClick={() => setAvaliando(a)}
                                                style={{
                                                    fontSize: 11, fontWeight: 600, color: '#F59E0B',
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    padding: '3px 6px', borderRadius: 4,
                                                    transition: 'all var(--transition)',
                                                    fontFamily: 'var(--font)',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FEF3C7'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >
                                                ★ Avaliar
                                            </button>
                                        )}
                                        {a.status === 'FINISHED' && a.jaAvaliou && (
                                            <Badge variant="muted">★ Avaliado</Badge>
                                        )}
                                    </div>
                                </div>

                                {expandedPayment === a.id && (
                                    <div style={{
                                        padding: '0 20px 12px',
                                        borderBottom: '1px solid var(--border)',
                                        background: 'var(--bg-surface)',
                                        animation: 'fadeIn 0.2s ease both',
                                    }}>
                                        <PagamentoCard appointment={a} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </Card>

            {/* Entrar na fila CTA */}
            <Card style={{ marginTop: 12 }}>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 16,
                }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                            Horário esgotado?
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Entre na fila e seja notificado quando uma vaga abrir
                        </div>
                    </div>
                    <Button variant="warning" onClick={() => navigate('/fila')}>
                        ⏳ Entrar na fila
                    </Button>
                </div>
            </Card>
        </div>
    )
}