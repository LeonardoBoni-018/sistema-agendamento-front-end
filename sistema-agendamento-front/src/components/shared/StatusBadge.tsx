import { AppointmentStatus } from '@/types/appointment'

const config: Record<AppointmentStatus, { label: string; bg: string; color: string }> = {
    PENDING: { label: 'Pendente', bg: 'var(--pending-light)', color: '#92400E' },
    CONFIRMED: { label: 'Confirmado', bg: 'var(--success-light)', color: '#065F46' },
    CANCELED: { label: 'Cancelado', bg: 'var(--danger-light)', color: '#991B1B' },
    FINISHED: { label: 'Finalizado', bg: 'var(--bg-surface)', color: 'var(--text-muted)' },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
    const { label, bg, color } = config[status]
    return (
        <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 600,
            padding: '3px 9px', borderRadius: 20, background: bg, color,
            letterSpacing: '0.02em',
        }}>
      {label}
    </span>
    )
}