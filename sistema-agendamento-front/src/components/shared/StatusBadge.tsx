import { AppointmentStatus } from '@/types/appointment'

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
    PENDING: {
        label: 'Pendente',
        className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    },
    CONFIRMED: {
        label: 'Confirmado',
        className: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    },
    CANCELED: {
        label: 'Cancelado',
        className: 'bg-red-500/10 text-red-400 border border-red-500/20',
    },
    FINISHED: {
        label: 'Finalizado',
        className: 'bg-green-500/10 text-green-400 border border-green-500/20',
    },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
    const config = statusConfig[status]
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
    )
}