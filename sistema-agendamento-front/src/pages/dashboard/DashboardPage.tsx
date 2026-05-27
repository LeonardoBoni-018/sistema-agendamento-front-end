import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { appointmentService } from '@/services/appointmentService'
import { dashboardService } from '@/services/dashboardService'
import { Appointment } from '@/types/appointment'
import { DashboardData } from '@/types/dashboard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments'
import { useAuthStore } from '@/store/authStore'
import { format, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Stat Card ──
function StatCard({
                      label, value, sub, trend, color, icon,
                  }: {
    label: string
    value: string | number
    sub?: string
    trend?: { value: number; positive: boolean }
    color?: string
    icon?: React.ReactNode
}) {
    return (
        <Card hover style={{ animation: 'fadeIn 0.3s ease both' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 12,
            }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </span>
                {icon && (
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--bg-surface)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color ?? 'var(--text-muted)',
                    }}>
                        {icon}
                    </div>
                )}
            </div>
            <div style={{
                fontSize: 28, fontWeight: 700, color: color ?? 'var(--text)',
                letterSpacing: '-0.03em', lineHeight: 1,
                animation: 'countUp 0.4s ease both',
            }}>
                {value}
            </div>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
            }}>
                {sub && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>
                )}
                {trend && (
                    <Badge variant={trend.positive ? 'success' : 'danger'} style={{ fontSize: 10 }}>
                        {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </Badge>
                )}
            </div>
        </Card>
    )
}

// ── Custom Tooltip ──
function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'var(--text)', color: 'white',
            padding: '8px 12px', borderRadius: 8,
            fontSize: 12, fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
        }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{label}</div>
            {payload.map((p: any) => (
                <div key={p.name} style={{ color: 'white' }}>
                    {p.name === 'receita' ? `R$ ${Number(p.value).toFixed(2)}` : p.value}
                </div>
            ))}
        </div>
    )
}

// ── Skeleton ──
function Skeletons({ count = 1, height = 80 }: { count?: number; height?: number }) {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height, borderRadius: 12 }} />
            ))}
        </>
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
                setAllData(await appointmentService.myAppointments())
            }
        } finally {
            setLoading(false)
        }
    }, [admin])

    useEffect(() => { load() }, [load])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
    const todayCount = appointments.filter(a => {
        try { return isToday(parseISO(a.date)) } catch { return false }
    }).length
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length
    const pending = appointments.filter(a => a.status === 'PENDING').length
    const canceled = appointments.filter(a => a.status === 'CANCELED').length
    const upcoming = appointments
        .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
        .slice(0, 6)

    const PIE_COLORS = ['#059669', '#D97706', '#DC2626', '#71717A']
    const pieData = analytics ? [
        { name: 'Confirmados', value: analytics.agendamentosConfirmados },
        { name: 'Pendentes', value: analytics.agendamentosPendentes },
        { name: 'Cancelados', value: analytics.agendamentosCancelados },
        { name: 'Finalizados', value: analytics.agendamentosFinalizados },
    ].filter(d => d.value > 0) : []

    return (
        <div style={{ maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Greeting */}
            <div style={{ animation: 'fadeIn 0.2s ease both' }}>
                <h2 style={{
                    fontSize: 22, fontWeight: 700, color: 'var(--text)',
                    letterSpacing: '-0.03em', marginBottom: 2,
                }}>
                    {greeting}, {user?.name?.split(' ')[0]} ✦
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} · {user?.comercioNome}
                </p>
            </div>

            {/* Admin dashboard */}
            {admin && analytics ? (
                <>
                    {/* KPI cards */}
                    <div className="stagger" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12,
                    }}>
                        <StatCard
                            label="Receita hoje"
                            value={`R$ ${Number(analytics.receitaHoje).toFixed(2)}`}
                            sub={`${analytics.agendamentosHoje} agendamentos`}
                            color="var(--success)"
                            icon={
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                </svg>
                            }
                        />
                        <StatCard
                            label="Receita do mês"
                            value={`R$ ${Number(analytics.receitaMes).toFixed(2)}`}
                            sub={`${analytics.agendamentosMes} agendamentos`}
                            icon={
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                    <polyline points="17 6 23 6 23 12"/>
                                </svg>
                            }
                        />
                        <StatCard
                            label="Agendamentos hoje"
                            value={analytics.agendamentosHoje}
                            sub={`${analytics.totalAgendamentos} no total`}
                            icon={
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                                </svg>
                            }
                        />
                        <StatCard
                            label="Avaliação média"
                            value={analytics.mediaAvaliacao ? `${analytics.mediaAvaliacao} ★` : '—'}
                            sub={`${analytics.totalAvaliacoes} avaliações`}
                            color="#F59E0B"
                            icon={
                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                </svg>
                            }
                        />
                    </div>

                    {/* Charts row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                        {/* Receita por mês */}
                        <Card padding="20px 20px 10px">
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: 20,
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                        letterSpacing: '-0.01em',
                                    }}>
                                        Receita por mês
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                        Últimos 6 meses
                                    </div>
                                </div>
                                <Badge variant="success">
                                    R$ {Number(analytics.receitaTotal).toFixed(2)} total
                                </Badge>
                            </div>
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={analytics.receitaPorMes}
                                           margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                                           tickFormatter={v => `R$${v}`}/>
                                    <Tooltip content={<CustomTooltip />}/>
                                    <Area type="monotone" dataKey="receita" stroke="#059669" strokeWidth={2}
                                          fill="url(#receitaGrad)" dot={{ fill: '#059669', strokeWidth: 0, r: 3 }}
                                          activeDot={{ r: 5, fill: '#059669' }}/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Pie chart status */}
                        <Card padding="20px">
                            <div style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                letterSpacing: '-0.01em', marginBottom: 4,
                            }}>
                                Status geral
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
                                {analytics.totalAgendamentos} agendamentos
                            </div>
                            {pieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={130}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={40}
                                                 outerRadius={60} paddingAngle={3} dataKey="value">
                                                {pieData.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                                        {pieData.map((d, i) => (
                                            <div key={d.name} style={{
                                                display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                              width: 8, height: 8, borderRadius: 2,
                              background: PIE_COLORS[i],
                              display: 'inline-block', flexShrink: 0,
                          }}/>
                                                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {d.name}
                          </span>
                                                </div>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>
                          {d.value}
                        </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{
                                    height: 130, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'var(--text-faint)', fontSize: 13,
                                }}>
                                    Sem dados
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Agendamentos por dia + serviços */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Card padding="20px 20px 10px">
                            <div style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                letterSpacing: '-0.01em', marginBottom: 4,
                            }}>
                                Agendamentos — 7 dias
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
                                Volume diário
                            </div>
                            <ResponsiveContainer width="100%" height={140}>
                                <BarChart data={analytics.agendamentosPorDia}
                                          margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                                    <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false}/>
                                    <Tooltip content={<CustomTooltip />}/>
                                    <Bar dataKey="quantidade" fill="var(--text)" radius={[4, 4, 0, 0]}
                                         maxBarSize={32}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card padding="20px">
                            <div style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                letterSpacing: '-0.01em', marginBottom: 16,
                            }}>
                                Destaques do período
                            </div>
                            {[
                                { label: 'Serviço mais agendado', value: analytics.servicoMaisAgendado, accent: true },
                                { label: 'Horário de pico', value: analytics.horarioPico },
                                { label: 'Taxa de cancelamento',
                                    value: analytics.totalAgendamentos > 0
                                        ? `${Math.round((analytics.agendamentosCancelados / analytics.totalAgendamentos) * 100)}%`
                                        : '0%' },
                                { label: 'Finalizados', value: String(analytics.agendamentosFinalizados) },
                                { label: 'Receita total', value: `R$ ${Number(analytics.receitaTotal).toFixed(2)}`, accent: true },
                            ].map(({ label, value, accent }) => (
                                <div key={label} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', padding: '9px 0',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                                    <span style={{
                                        fontSize: 12, fontWeight: 700,
                                        color: accent ? 'var(--text)' : 'var(--text-secondary)',
                                        letterSpacing: '-0.01em',
                                    }}>
                    {value}
                  </span>
                                </div>
                            ))}
                        </Card>
                    </div>
                </>
            ) : !admin && !loading && (
                <div className="stagger" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12,
                }}>
                    <StatCard label="Hoje" value={todayCount} sub="agendamentos" />
                    <StatCard label="Confirmados" value={confirmed} color="var(--success)" />
                    <StatCard label="Pendentes" value={pending} color="var(--warning)" />
                </div>
            )}

            {loading && (
                <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    <Skeletons count={4} height={100} />
                </div>
            )}

            {/* Próximos agendamentos */}
            <Card padding={0} style={{ overflow: 'hidden' }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{
                            fontSize: 13, fontWeight: 600, color: 'var(--text)',
                            letterSpacing: '-0.01em',
                        }}>
                            {admin ? 'Próximos agendamentos' : 'Meus próximos horários'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            Pendentes e confirmados · tempo real
                        </div>
                    </div>
                    {!admin && (
                        <Button
                            size="sm"
                            onClick={() => navigate('/appointments/new')}
                            icon={
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            }
                        >
                            Agendar
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Skeletons count={3} height={52} />
                    </div>
                ) : upcoming.length === 0 ? (
                    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: 'var(--bg-surface)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 12px',
                        }}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1.5}>
                                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                            </svg>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                            Nenhum agendamento próximo
                        </p>
                        {!admin && (
                            <Button size="sm" onClick={() => navigate('/appointments/new')}>
                                Criar agendamento
                            </Button>
                        )}
                    </div>
                ) : (
                    <div>
                        {upcoming.map((a, idx) => (
                            <div key={a.id} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '12px 20px',
                                borderBottom: idx < upcoming.length - 1
                                    ? '1px solid var(--border)' : 'none',
                                transition: 'background var(--transition)',
                                cursor: 'default',
                            }}
                                 onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                                 onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    minWidth: 44, fontSize: 13, fontWeight: 600,
                                    color: 'var(--text-muted)',
                                    fontVariantNumeric: 'tabular-nums',
                                    fontFamily: 'var(--font-mono)',
                                }}>
                                    {a.time?.slice(0, 5)}
                                </div>
                                <div style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: a.status === 'CONFIRMED' ? 'var(--success)' : 'var(--warning)',
                                    flexShrink: 0,
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                        letterSpacing: '-0.01em',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {admin ? a.userName : a.jobName}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        {admin ? a.jobName
                                            : format(parseISO(a.date), "dd 'de' MMM", { locale: ptBR })}
                                        {a.funcionarioNome && ` · ${a.funcionarioNome}`}
                                    </div>
                                </div>
                                <StatusBadge status={a.status} />
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Cancelados recentes — apenas usuário */}
            {!admin && canceled > 0 && (
                <Card style={{ borderColor: '#FECACA', background: 'var(--danger-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--danger)" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        <span style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 500 }}>
              Você tem {canceled} agendamento{canceled > 1 ? 's' : ''} cancelado{canceled > 1 ? 's' : ''}.
            </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            style={{ marginLeft: 'auto', color: 'var(--danger)' }}
                            onClick={() => navigate('/appointments')}
                        >
                            Ver todos
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    )
}