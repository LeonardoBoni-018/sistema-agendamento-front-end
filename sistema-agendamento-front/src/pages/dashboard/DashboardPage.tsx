import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { appointmentService } from '@/services/appointmentService'
import { dashboardService } from '@/services/dashboardService'
import { Appointment } from '@/types/appointment'
import { DashboardData } from '@/types/dashboard'
import { StatusBadge } from '@/components/shared/StatusBadge'
// import { StarRating } from '@/components/shared/StarRating'
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments'
import { useAuthStore } from '@/store/authStore'
import { format, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function StatCard({
                      label, value, sub, color,
                  }: {
    label: string; value: string | number; sub?: string; color?: string
}) {
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '18px 20px',
        }}>
            <div style={{
                fontSize: 26, fontWeight: 500,
                color: color ?? 'var(--text)', lineHeight: 1,
            }}>
                {value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {label}
            </div>
            {sub && (
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                    {sub}
                </div>
            )}
        </div>
    )
}

function MiniBar({ label, value, max }: {
    label: string; value: number; max: number
}) {
    const pct = max > 0 ? (value / max) * 100 : 0
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 12, marginBottom: 4,
            }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{value}</span>
            </div>
            <div style={{
                height: 5, background: 'var(--bg-surface)',
                borderRadius: 3, overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', width: `${pct}%`,
                    background: 'var(--text)', borderRadius: 3,
                    transition: 'width 0.4s ease',
                }} />
            </div>
        </div>
    )
}

export function DashboardPage() {
    const { isAdmin, user } = useAuthStore()
    const navigate = useNavigate()
    const admin = isAdmin()
    const [allData, setAllData] = useState<Appointment[]>([])
    const [analytics, setAnalytics] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    const { appointments } = useRealtimeAppointments(allData, {
        filterUserId: admin ? undefined : user?.id,
    })

    const load = useCallback(async () => {
        try {
            if (admin) {
                const [appts, dash] = await Promise.all([
                    appointmentService.getAllAppointments(),
                    dashboardService.getDashboard(),
                ])
                setAllData(appts)
                setAnalytics(dash)
            } else {
                const appts = await appointmentService.myAppointments()
                setAllData(appts)
            }
        } finally {
            setLoading(false)
        }
    }, [admin])

    useEffect(() => { load() }, [load])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

    const upcoming = appointments
        .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
        .slice(0, 5)

    const todayCount = appointments.filter(a => {
        try { return isToday(parseISO(a.date)) } catch { return false }
    }).length

    if (loading) {
        return (
            <div style={{ maxWidth: 900 }}>
                <div style={{ height: 60, background: 'var(--bg-card)', borderRadius: 'var(--radius)', marginBottom: 20, animation: 'pulse 1.5s infinite' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} style={{ height: 90, background: 'var(--bg-card)', borderRadius: 'var(--radius)' }} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 900 }}>
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
                    {greeting}, {user?.name?.split(' ')[0]} ✦
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })} · {user?.comercioNome}
                </div>
            </div>

            {admin && analytics ? (
                <>
                    {/* Cards analíticos */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                        gap: 12, marginBottom: 20,
                    }}>
                        <StatCard
                            label="Receita hoje"
                            value={`R$ ${Number(analytics.receitaHoje).toFixed(2)}`}
                            color="var(--success)"
                        />
                        <StatCard
                            label="Receita do mês"
                            value={`R$ ${Number(analytics.receitaMes).toFixed(2)}`}
                            sub={`${analytics.agendamentosMes} agendamentos`}
                        />
                        <StatCard
                            label="Agendamentos hoje"
                            value={analytics.agendamentosHoje}
                            sub={`${analytics.totalAgendamentos} no total`}
                        />
                        <StatCard
                            label="Avaliação média"
                            value={analytics.mediaAvaliacao
                                ? `${analytics.mediaAvaliacao} ★`
                                : '—'}
                            sub={`${analytics.totalAvaliacoes} avaliações`}
                            color="#F59E0B"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {/* Receita por mês */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '18px 20px',
                        }}>
                            <div style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                marginBottom: 16,
                            }}>
                                Receita por mês
                            </div>
                            {analytics.receitaPorMes.map(m => {
                                const max = Math.max(
                                    ...analytics.receitaPorMes.map(x => Number(x.receita))
                                )
                                return (
                                    <MiniBar
                                        key={m.mes}
                                        label={m.mes}
                                        value={Number(m.receita)}
                                        max={max}
                                    />
                                )
                            })}
                        </div>

                        {/* Agendamentos por dia */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '18px 20px',
                        }}>
                            <div style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                marginBottom: 16,
                            }}>
                                Agendamentos — últimos 7 dias
                            </div>
                            {analytics.agendamentosPorDia.map(d => {
                                const max = Math.max(
                                    ...analytics.agendamentosPorDia.map(x => x.quantidade)
                                )
                                return (
                                    <MiniBar
                                        key={d.dia}
                                        label={d.dia}
                                        value={d.quantidade}
                                        max={Math.max(max, 1)}
                                    />
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {/* Por serviço */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '18px 20px',
                        }}>
                            <div style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                marginBottom: 16,
                            }}>
                                Agendamentos por serviço
                            </div>
                            {Object.entries(analytics.agendamentosPorServico)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([nome, qty]) => {
                                    const max = Math.max(
                                        ...Object.values(analytics.agendamentosPorServico)
                                    )
                                    return (
                                        <MiniBar key={nome} label={nome} value={qty} max={max} />
                                    )
                                })}
                        </div>

                        {/* Destaques */}
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '18px 20px',
                        }}>
                            <div style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                marginBottom: 16,
                            }}>
                                Destaques
                            </div>
                            {[
                                { label: 'Serviço mais agendado', value: analytics.servicoMaisAgendado },
                                { label: 'Horário de pico', value: analytics.horarioPico },
                                { label: 'Total finalizados', value: String(analytics.agendamentosFinalizados) },
                                { label: 'Taxa de cancelamento', value: analytics.totalAgendamentos > 0
                                        ? `${Math.round((analytics.agendamentosCancelados / analytics.totalAgendamentos) * 100)}%`
                                        : '0%' },
                                { label: 'Receita total', value: `R$ ${Number(analytics.receitaTotal).toFixed(2)}` },
                            ].map(({ label, value }) => (
                                <div key={label} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', padding: '8px 0',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {label}
                  </span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {value}
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : !admin && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                    gap: 12, marginBottom: 20,
                }}>
                    <StatCard label="Hoje" value={todayCount} />
                    <StatCard
                        label="Confirmados"
                        value={appointments.filter(a => a.status === 'CONFIRMED').length}
                        color="var(--success)"
                    />
                    <StatCard
                        label="Pendentes"
                        value={appointments.filter(a => a.status === 'PENDING').length}
                        color="var(--pending)"
                    />
                </div>
            )}

            {/* Próximos agendamentos */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
                <div style={{
                    padding: '14px 20px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                        {admin ? 'Próximos agendamentos' : 'Meus próximos horários'}
                    </div>
                    {!admin && (
                        <button onClick={() => navigate('/appointments/new')} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--text)', color: 'white',
                            fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                        }}>
                            <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 13 }} />
                            Agendar
                        </button>
                    )}
                </div>

                {upcoming.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Nenhum agendamento próximo
                        </div>
                    </div>
                ) : (
                    upcoming.map((a, idx) => (
                        <div key={a.id} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '13px 20px',
                            borderBottom: idx < upcoming.length - 1
                                ? '1px solid var(--border)' : 'none',
                        }}>
                            <div style={{
                                minWidth: 42, fontSize: 13, fontWeight: 600,
                                color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums',
                            }}>
                                {a.time?.slice(0, 5)}
                            </div>
                            <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: a.status === 'CONFIRMED'
                                    ? 'var(--success)' : 'var(--pending)',
                                flexShrink: 0,
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {admin ? a.userName : a.jobName}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                                    {admin ? a.jobName
                                        : format(parseISO(a.date), "dd 'de' MMM", { locale: ptBR })}
                                </div>
                            </div>
                            <StatusBadge status={a.status} />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}