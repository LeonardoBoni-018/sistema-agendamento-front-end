import { useEffect, useState } from 'react'
import { sseService, SsePayload } from '@/services/sseService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notification {
    id: string
    type: string
    message: string
    detail: string
    time: Date
    read: boolean
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [open, setOpen] = useState(false)

    const unread = notifications.filter(n => !n.read).length

    useEffect(() => {
        const events = [
            'APPOINTMENT_CREATED',
            'APPOINTMENT_STATUS_UPDATED',
            'APPOINTMENT_CANCELED',
        ] as const

        const unsubs = events.map(event =>
            sseService.on(event, (payload: SsePayload) => {
                const appt = payload.data.appointment
                const msg = payload.data.message ?? 'Atualização de agendamento'
                const detail = appt
                    ? `${appt.jobName} · ${appt.time?.slice(0, 5)}`
                    : ''

                setNotifications(prev => [{
                    id: `${event}-${Date.now()}`,
                    type: event,
                    message: msg,
                    detail,
                    time: new Date(),
                    read: false,
                }, ...prev].slice(0, 20))
            })
        )

        return () => unsubs.forEach(u => u())
    }, [])

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const iconColor = (type: string) => {
        if (type === 'APPOINTMENT_CREATED') return '#059669'
        if (type === 'APPOINTMENT_CANCELED') return '#DC2626'
        return '#D97706'
    }

    const iconName = (type: string) => {
        if (type === 'APPOINTMENT_CREATED') return 'ti-calendar-plus'
        if (type === 'APPOINTMENT_CANCELED') return 'ti-calendar-x'
        return 'ti-calendar-check'
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => { setOpen(o => !o); if (!open) markAllRead() }}
                style={{
                    position: 'relative', background: 'none',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    padding: '6px 8px', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                }}
                aria-label="Notificações"
            >
                <i className="ti ti-bell" aria-hidden="true" style={{ fontSize: 16 }} />
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 16, height: 16, borderRadius: '50%',
                        background: 'var(--danger)', color: 'white',
                        fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
            {unread > 9 ? '9+' : unread}
          </span>
                )}
            </button>

            {open && (
                <>
                    <div
                        onClick={() => setOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 40,
                        }}
                    />
                    <div style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        width: 320, background: 'var(--bg-card)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                        zIndex: 50, overflow: 'hidden',
                    }}>
                        <div style={{
                            padding: '12px 16px', borderBottom: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                Notificações
              </span>
                            {notifications.length > 0 && (
                                <button onClick={markAllRead} style={{
                                    fontSize: 11, color: 'var(--text-muted)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                }}>
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>

                        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{
                                    padding: '32px 16px', textAlign: 'center',
                                    color: 'var(--text-faint)', fontSize: 13,
                                }}>
                                    Nenhuma notificação
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border)',
                                        display: 'flex', gap: 10, alignItems: 'flex-start',
                                        background: n.read ? 'transparent' : 'var(--bg-surface)',
                                    }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: `${iconColor(n.type)}18`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <i
                                                className={`ti ${iconName(n.type)}`}
                                                aria-hidden="true"
                                                style={{ fontSize: 14, color: iconColor(n.type) }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                                                {n.message}
                                            </div>
                                            {n.detail && (
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                                    {n.detail}
                                                </div>
                                            )}
                                            <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>
                                                {format(n.time, "HH:mm · dd MMM", { locale: ptBR })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}