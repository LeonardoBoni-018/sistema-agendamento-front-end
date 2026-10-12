import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { appointmentService } from '@/services/appointmentService'
import { dashboardService } from '@/services/dashboardService'
import { Appointment } from '@/types/appointment'
import { DashboardData } from '@/types/dashboard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments'
import { useAuthStore } from '@/store/authStore'
import { format, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const HOUR_PX = 64

const brl = (v: number | string) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const toMinutes = (t?: string) => {
    if (!t) return 0
    const [h, m] = t.split(':').map(Number)
    return h * 60 + (m || 0)
}

const panel: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'var(--text)', color: 'var(--on-strong)',
            padding: '6px 10px', borderRadius: 6, fontSize: 12.5,
        }}>
            <div style={{ opacity: 0.7 }}>{label}</div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((p: any) => (
                <div key={p.name} style={{ fontWeight: 600 }}>
                    {p.name === 'receita' ? brl(p.value) : p.value}
                </div>
            ))}
        </div>
    )
}

/** Folha do dia: horas à esquerda, atendimentos posicionados pelo horário real. */
function DaySheet({ items, admin }: { items: Appointment[]; admin: boolean }) {
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000)
        return () => clearInterval(id)
    }, [])

    const ranges = items.map(a => {
        const start = toMinutes(a.time)
        return { a, start, end: start + (a.jobDurationMinutes || 30) }
    })
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const firstH = Math.min(8, ...ranges.map(r => Math.floor(r.start / 60)), Math.floor(nowMin / 60))
    const lastH = Math.max(18, ...ranges.map(r => Math.ceil(r.end / 60)))
    const hours = Array.from({ length: lastH - firstH + 1 }, (_, i) => firstH + i)
    const y = (min: number) => ((min - firstH * 60) / 60) * HOUR_PX
    const showNow = nowMin >= firstH * 60 && nowMin <= lastH * 60

    return (
        <div style={{ position: 'relative', height: (lastH - firstH) * HOUR_PX + 24, paddingTop: 12 }}>
            {hours.map(h => (
                <div key={h} style={{
                    position: 'absolute', left: 0, right: 0, top: 12 + (h - firstH) * HOUR_PX,
                    display: 'flex', alignItems: 'flex-start',
                }}>
                    <span style={{
                        width: 52, fontSize: 12.5, color: 'var(--text-muted)',
                        transform: 'translateY(-9px)', flexShrink: 0,
                    }}>
                        {String(h).padStart(2, '0')}:00
                    </span>
                    <div style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
                </div>
            ))}

            {ranges.map(({ a, start, end }) => {
                const done = a.status === 'FINISHED'
                const pending = a.status === 'PENDING'
                return (
                    <div key={a.id} style={{
                        position: 'absolute', left: 62, right: 8,
                        top: 12 + y(start) + 2, height: Math.max(((end - start) / 60) * HOUR_PX - 4, 30),
                        padding: '5px 12px', overflow: 'hidden',
                        borderRadius: 6,
                        background: pending ? 'transparent' : done ? 'var(--bg-surface)' : 'var(--mark-soft)',
                        border: pending ? '1.5px dashed var(--border-strong)' : '1px solid transparent',
                        color: 'var(--text)',
                        opacity: done ? 0.65 : 1,
                        display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap',
                    }}>
                        <span style={{ fontWeight: 650, fontSize: 14 }}>{admin ? a.userName : a.jobName}</span>
                        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                            {a.time.slice(0, 5)}–{String(Math.floor(end / 60) % 24).padStart(2, '0')}:{String(end % 60).padStart(2, '0')}
                            {admin ? ` · ${a.jobName}` : ''}
                            {a.funcionarioNome ? ` · ${a.funcionarioNome}` : ''}
                        </span>
                        {pending && <span style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>aguardando</span>}
                    </div>
                )
            })}

            {showNow && (
                <div style={{
                    position: 'absolute', left: 52, right: 0, top: 12 + y(nowMin),
                    borderTop: '2px solid var(--text)', pointerEvents: 'none',
                }}>
                    <span style={{
                        position: 'absolute', left: -4, top: -11, padding: '1px 7px', borderRadius: 4,
                        background: 'var(--mark)', color: 'var(--on-mark)', fontSize: 11.5, fontWeight: 700,
                    }}>
                        {format(now, 'HH:mm')}
                    </span>
                </div>
            )}
        </div>
    )
}

function Ledger({ rows }: { rows: { label: string; value: string; hint?: string }[] }) {
    return (
        <div style={{ ...panel, overflow: 'hidden' }}>
            {rows.map((r, i) => (
                <div key={r.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12,
                    padding: '13px 18px', borderTop: i ? '1px solid var(--border)' : 'none',
                }}>
                    <div>
                        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{r.label}</div>
                        {r.hint && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.hint}</div>}
                    </div>
                    <div className="serif" style={{ fontSize: 26, lineHeight: 1 }}>{r.value}</div>
                </div>
            ))}
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
                setAllData(await appointmentService.myAppointments())
            }
        } finally {
            setLoading(false)
        }
    }, [admin])

    useEffect(() => { load() }, [load])

    const today = new Date()
    const hour = today.getHours()
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

    const todayItems = useMemo(() => appointments
        .filter(a => a.status !== 'CANCELED')
        .filter(a => { try { return isToday(parseISO(a.date)) } catch { return false } })
        .sort((a, b) => a.time.localeCompare(b.time)), [appointments])

    const upcoming = useMemo(() => appointments
        .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
        .filter(a => { try { return !isToday(parseISO(a.date)) && parseISO(a.date) > new Date() } catch { return false } })
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 6), [appointments])

    const pendingToday = todayItems.filter(a => a.status === 'PENDING').length
    const canceled = appointments.filter(a => a.status === 'CANCELED').length

    const summary = todayItems.length === 0
        ? 'Nenhum horário marcado para hoje.'
        : `${todayItems.length} ${todayItems.length === 1 ? 'horário' : 'horários'} hoje` +
          (pendingToday ? `, ${pendingToday} aguardando confirmação.` : '.')

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
                <div className="serif" style={{ fontSize: 'clamp(84px, 14vw, 132px)', lineHeight: 0.8, letterSpacing: '-0.04em' }}>
                    {format(today, 'dd')}
                </div>
                <div style={{ paddingBottom: 4 }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                        {format(today, 'EEEE', { locale: ptBR })}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                        {format(today, "MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', maxWidth: 340, paddingBottom: 4 }}>
                    <div style={{ fontSize: 15 }}>{greeting}, {user?.name?.split(' ')[0]}.</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{loading ? 'Carregando sua agenda…' : summary}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)', gap: 28, alignItems: 'start' }}>
                <section style={{ ...panel, padding: '10px 14px 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px 0' }}>
                        <h2 style={{ fontSize: 15, fontWeight: 650 }}>Agenda de hoje</h2>
                        {!admin && (
                            <Button size="sm" onClick={() => navigate('/appointments/new')}>Novo agendamento</Button>
                        )}
                    </div>
                    {loading ? (
                        <div className="skeleton" style={{ height: 320, margin: '12px 0' }} />
                    ) : (
                        <DaySheet items={todayItems} admin={admin} />
                    )}
                </section>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {admin && analytics && (
                        <Ledger rows={[
                            { label: 'Receita de hoje', value: brl(analytics.receitaHoje), hint: `${analytics.agendamentosHoje} agendamentos` },
                            { label: 'Receita do mês', value: brl(analytics.receitaMes), hint: `${analytics.agendamentosMes} agendamentos` },
                            { label: 'Avaliação média', value: analytics.mediaAvaliacao ? String(analytics.mediaAvaliacao) : '—', hint: `${analytics.totalAvaliacoes} avaliações` },
                        ]} />
                    )}

                    <section>
                        <h2 style={{ fontSize: 15, fontWeight: 650, marginBottom: 10 }}>
                            {admin ? 'Próximos dias' : 'Seus próximos horários'}
                        </h2>
                        {loading ? (
                            <div className="skeleton" style={{ height: 160 }} />
                        ) : upcoming.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>
                                Nada marcado além de hoje.
                                {!admin && ' Que tal reservar o próximo horário?'}
                            </p>
                        ) : (
                            <ul style={{ listStyle: 'none', ...panel }}>
                                {upcoming.map((a, i) => (
                                    <li key={a.id} style={{
                                        display: 'flex', gap: 14, alignItems: 'center', padding: '11px 16px',
                                        borderTop: i ? '1px solid var(--border)' : 'none',
                                    }}>
                                        <div style={{ width: 54, flexShrink: 0 }}>
                                            <div style={{ fontWeight: 650 }}>{format(parseISO(a.date), 'dd MMM', { locale: ptBR })}</div>
                                            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{a.time.slice(0, 5)}</div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {admin ? a.userName : a.jobName}
                                            </div>
                                            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                                                {admin ? a.jobName : a.funcionarioNome}
                                            </div>
                                        </div>
                                        <StatusBadge status={a.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {!admin && canceled > 0 && (
                        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                            Você tem {canceled} agendamento{canceled > 1 ? 's' : ''} cancelado{canceled > 1 ? 's' : ''}.{' '}
                            <button onClick={() => navigate('/appointments')} style={{
                                background: 'none', border: 0, cursor: 'pointer', color: 'var(--text)',
                                textDecoration: 'underline', fontSize: 'inherit',
                            }}>Ver histórico</button>
                        </p>
                    )}
                </div>
            </div>

            {admin && analytics && (
                <section>
                    <h2 className="serif" style={{ fontSize: 28, marginBottom: 14 }}>Desempenho</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 20 }}>
                        <div style={{ ...panel, padding: '16px 16px 6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontWeight: 600 }}>Receita por mês</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{brl(analytics.receitaTotal)} no total</span>
                            </div>
                            <ResponsiveContainer width="100%" height={190}>
                                <AreaChart data={analytics.receitaPorMes} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                                    <CartesianGrid stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                                    <Tooltip content={<ChartTip />} />
                                    <Area type="monotone" dataKey="receita" stroke="var(--text)" strokeWidth={2}
                                          fill="var(--mark-soft)" fillOpacity={1} dot={false} activeDot={{ r: 4, fill: 'var(--text)' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ ...panel, padding: '16px 16px 6px' }}>
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>Agendamentos nos últimos 7 dias</div>
                            <ResponsiveContainer width="100%" height={190}>
                                <BarChart data={analytics.agendamentosPorDia} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                                    <CartesianGrid stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="dia" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<ChartTip />} cursor={{ fill: 'var(--bg-surface)' }} />
                                    <Bar dataKey="quantidade" fill="var(--text)" radius={[2, 2, 0, 0]} maxBarSize={26} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <dl style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0,
                        marginTop: 20, ...panel,
                    }}>
                        {[
                            ['Serviço mais agendado', analytics.servicoMaisAgendado || '—'],
                            ['Horário de pico', analytics.horarioPico || '—'],
                            ['Taxa de cancelamento', analytics.totalAgendamentos > 0
                                ? `${Math.round((analytics.agendamentosCancelados / analytics.totalAgendamentos) * 100)}%` : '0%'],
                            ['Atendimentos finalizados', String(analytics.agendamentosFinalizados)],
                        ].map(([k, v], i) => (
                            <div key={k} style={{ padding: '14px 18px', borderLeft: i ? '1px solid var(--border)' : 'none' }}>
                                <dt style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{k}</dt>
                                <dd style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>{v}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}
        </div>
    )
}
