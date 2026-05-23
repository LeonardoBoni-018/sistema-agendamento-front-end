import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { sseService, SsePayload } from '@/services/sseService'
import { Appointment } from '@/types/appointment'

interface Options {
    filterUserId?: number
}

export function useRealtimeAppointments(
    initialData: Appointment[],
    options: Options = {}
) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialData)

    // ✅ Sincroniza quando initialData muda (ex: filtro aplicado)
    useEffect(() => {
        setAppointments(initialData)
    }, [initialData])

    const filterUserIdRef = useRef(options.filterUserId)
    filterUserIdRef.current = options.filterUserId

    useEffect(() => {
        // ✅ APPOINTMENT_CREATED — adiciona na lista se não existir
        const unsubCreate = sseService.on(
            'APPOINTMENT_CREATED',
            (payload: SsePayload) => {
                const appt: Appointment = payload.data?.appointment
                if (!appt) return

                const userId = filterUserIdRef.current
                if (userId && appt.userId !== userId) return

                setAppointments(prev => {
                    const exists = prev.some(a => a.id === appt.id)
                    if (exists) return prev
                    return [appt, ...prev]
                })

                toast.info(payload.data?.message ?? 'Novo agendamento', {
                    description: `${appt.jobName} · ${appt.time?.slice(0, 5)}`,
                    duration: 5000,
                })
            }
        )

        // ✅ APPOINTMENT_STATUS_UPDATED — atualiza o item existente pelo id
        const unsubUpdated = sseService.on(
            'APPOINTMENT_STATUS_UPDATED',
            (payload: SsePayload) => {
                const appt: Appointment = payload.data?.appointment
                if (!appt) return

                const userId = filterUserIdRef.current
                if (userId && appt.userId !== userId) return

                // ✅ Sempre atualiza — independente de o item estar visível no filtro
                setAppointments(prev =>
                    prev.map(a => (a.id === appt.id ? { ...a, ...appt } : a))
                )

                const msg = payload.data?.message ?? 'Status atualizado'
                if (appt.status === 'CONFIRMED') {
                    toast.success(msg, { duration: 5000 })
                } else if (appt.status === 'CANCELED') {
                    toast.error(msg, { duration: 5000 })
                } else {
                    toast.info(msg, { duration: 5000 })
                }
            }
        )

        // ✅ APPOINTMENT_CANCELED — atualiza status para CANCELED
        const unsubCanceled = sseService.on(
            'APPOINTMENT_CANCELED',
            (payload: SsePayload) => {
                const appt: Appointment = payload.data?.appointment
                if (!appt) return

                const userId = filterUserIdRef.current
                if (userId && appt.userId !== userId) return

                setAppointments(prev =>
                    prev.map(a => (a.id === appt.id ? { ...a, ...appt } : a))
                )

                toast.error(payload.data?.message ?? 'Agendamento cancelado', {
                    duration: 5000,
                })
            }
        )

        return () => {
            unsubCreate()
            unsubUpdated()
            unsubCanceled()
        }
    }, [])

    return { appointments, setAppointments }
}