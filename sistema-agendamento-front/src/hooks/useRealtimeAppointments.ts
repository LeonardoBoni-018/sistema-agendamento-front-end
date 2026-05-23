import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { sseService, SsePayload } from '@/services/sseService'
import { Appointment } from '@/types/appointment'

interface Options {
    filterUserId?: number
    onFilaVaga?: (data: any) => void
    onPagamentoAprovado?: (data: any) => void
}

export function useRealtimeAppointments(
    initialData: Appointment[],
    options: Options = {}
) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialData)

    useEffect(() => {
        setAppointments(initialData)
    }, [initialData])

    const filterUserIdRef = useRef(options.filterUserId)
    filterUserIdRef.current = options.filterUserId

    const onFilaVagaRef = useRef(options.onFilaVaga)
    onFilaVagaRef.current = options.onFilaVaga

    const onPagamentoRef = useRef(options.onPagamentoAprovado)
    onPagamentoRef.current = options.onPagamentoAprovado

    useEffect(() => {
        const unsubCreate = sseService.on('APPOINTMENT_CREATED', (p: SsePayload) => {
            const appt: Appointment = p.data?.appointment
            if (!appt) return
            const userId = filterUserIdRef.current
            if (userId && appt.userId !== userId) return
            setAppointments(prev => {
                if (prev.some(a => a.id === appt.id)) return prev
                return [appt, ...prev]
            })
            toast.info(p.data?.message ?? 'Novo agendamento', {
                description: `${appt.jobName} · ${appt.time?.slice(0, 5)}`,
                duration: 5000,
            })
        })

        const unsubUpdated = sseService.on(
            'APPOINTMENT_STATUS_UPDATED', (p: SsePayload) => {
                const appt: Appointment = p.data?.appointment
                if (!appt) return
                const userId = filterUserIdRef.current
                if (userId && appt.userId !== userId) return
                setAppointments(prev =>
                    prev.map(a => a.id === appt.id ? { ...a, ...appt } : a)
                )
                const msg = p.data?.message ?? 'Status atualizado'
                if (appt.status === 'CONFIRMED') toast.success(msg, { duration: 5000 })
                else if (appt.status === 'CANCELED') toast.error(msg, { duration: 5000 })
                else toast.info(msg, { duration: 5000 })
            })

        const unsubCanceled = sseService.on(
            'APPOINTMENT_CANCELED', (p: SsePayload) => {
                const appt: Appointment = p.data?.appointment
                if (!appt) return
                const userId = filterUserIdRef.current
                if (userId && appt.userId !== userId) return
                setAppointments(prev =>
                    prev.map(a => a.id === appt.id ? { ...a, ...appt } : a)
                )
                toast.error(p.data?.message ?? 'Agendamento cancelado', { duration: 5000 })
            })

        const unsubFila = sseService.on(
            'FILA_VAGA_DISPONIVEL', (p: SsePayload) => {
                const userId = filterUserIdRef.current
                if (!userId) return
                if (p.data?.userId !== userId) return
                toast.success('🎉 Vaga disponível! Acesse seus agendamentos.', {
                    duration: 10000,
                    action: {
                        label: 'Agendar agora',
                        onClick: () => window.location.href = '/appointments/new',
                    },
                })
                onFilaVagaRef.current?.(p.data)
            })

        const unsubPagamento = sseService.on(
            'PAGAMENTO_APROVADO', (p: SsePayload) => {
                toast.success('💳 Pagamento aprovado! Agendamento confirmado.', {
                    duration: 8000,
                })
                onPagamentoRef.current?.(p.data)
                // Atualiza status do agendamento para CONFIRMED
                if (p.data?.appointmentId) {
                    setAppointments(prev =>
                        prev.map(a =>
                            a.id === p.data.appointmentId
                                ? { ...a, status: 'CONFIRMED' as any }
                                : a
                        )
                    )
                }
            })

        return () => {
            unsubCreate()
            unsubUpdated()
            unsubCanceled()
            unsubFila()
            unsubPagamento()
        }
    }, [])

    return { appointments, setAppointments }
}