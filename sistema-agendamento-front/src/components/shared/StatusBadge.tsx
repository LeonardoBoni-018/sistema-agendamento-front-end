import { AppointmentStatus } from '@/types/appointment'
import { Badge, BadgeVariant } from '@/components/ui/badge'

const config: Record<AppointmentStatus, { label: string; variant: BadgeVariant; dot: boolean }> = {
    PENDING: { label: 'Pendente', variant: 'warning', dot: true },
    CONFIRMED: { label: 'Confirmado', variant: 'success', dot: true },
    CANCELED: { label: 'Cancelado', variant: 'danger', dot: false },
    FINISHED: { label: 'Finalizado', variant: 'muted', dot: false },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
    const { label, variant, dot } = config[status]
    return <Badge variant={variant} dot={dot}>{label}</Badge>
}