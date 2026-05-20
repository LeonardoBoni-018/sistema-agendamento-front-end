import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { sseService, SsePayload } from '@/services/sseService'
import { Appointment } from '@/types/appointment'

interface Options {
    onCreated?: (appointment: Appointment) => void
    onUpdated?: (appointment: Appointment) => void
    onCanceled?: (appointment: Appointment) => void
    filterUserId?: number
}

export function useRealtimeAppointments(
    initialData: Appointment[],
    options: Options = {}
) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialData)

    useEffect(() => {
        setAppointments(initialData)
    }, [initialData.length])

    useEffect(() => {
        const unsubCreate = sseService.on('APPOINTMENT_CREATED', (payload: SsePayload) => {
            const appt: Appointment = payload.data.appointment
            const msg: string = payload.data.message ?? 'Novo agendamento criado'

            if (options.filterUserId && appt.userId !== options.filterUserId) return

            setAppointments(prev => {
                const exists = prev.find(a => a.id === appt.id)
                if (exists) return prev
                return [appt, ...prev]
            })

            toast.info(msg, {
                description: `${appt.jobName} · ${appt.time?.slice(0, 5)}`,
                duration: 5000,
            })

            options.onCreated?.(appt)
        })

        const unsubUpdated = sseService.on('APPOINTMENT_STATUS_UPDATED', (payload: SsePayload) => {
            const appt: Appointment = payload.data.appointment
            const msg: string = payload.data.message ?? 'Status atualizado'

            if (options.filterUserId && appt.userId !== options.filterUserId) return

            setAppointments(prev =>
                prev.map(a => a.id === appt.id ? appt : a)
            )

            const toastFn = appt.status === 'CONFIRMED'
                ? toast.success
                : appt.status === 'CANCELED'
                    ? toast.error
                    : toast.info

            toastFn(msg, { duration: 5000 })
            options.onUpdated?.(appt)
        })

        const unsubCanceled = sseService.on('APPOINTMENT_CANCELED', (payload: SsePayload) => {
            const appt: Appointment = payload.data.appointment
            const msg: string = payload.data.message ?? 'Agendamento cancelado'

            if (options.filterUserId && appt.userId !== options.filterUserId) return

            setAppointments(prev =>
                prev.map(a => a.id === appt.id ? appt : a)
            )

            toast.error(msg, { duration: 5000 })
            options.onCanceled?.(appt)
        })

        return () => {
            unsubCreate()
            unsubUpdated()
            unsubCanceled()
        }
    }, [options.filterUserId])

    return { appointments, setAppointments }
}