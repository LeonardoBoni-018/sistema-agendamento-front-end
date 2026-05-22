import { useAuthStore } from '@/store/authStore'

export type SseEventType =
    | 'APPOINTMENT_CREATED'
    | 'APPOINTMENT_CANCELED'
    | 'APPOINTMENT_STATUS_UPDATED'
    | 'JOB_CREATED'
    | 'JOB_UPDATED'
    | 'JOB_DELETED'
    | 'connected'

export interface SsePayload {
    type: SseEventType
    data: {
        appointment?: any
        job?: any
        jobId?: number
        message?: string
    }
}

type Handler = (payload: SsePayload) => void

class SseService {
    private es: EventSource | null = null
    private handlers = new Map<SseEventType, Set<Handler>>()
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null
    private reconnectDelay = 2000
    private stopped = false

    connect() {
        if (this.es || this.stopped) return

        const token = useAuthStore.getState().token
        if (!token) return

        const url = `http://localhost:8080/v1/events/stream?token=${token}`
        this.es = new EventSource(url)

        this.es.onopen = () => {
            console.log('[SSE] Conectado')
            this.reconnectDelay = 2000
        }

        this.es.onerror = () => {
            console.warn('[SSE] Erro de conexão, reconectando...')
            this.closeEventSource()

            if (!this.stopped) {
                this.reconnectTimer = setTimeout(() => {
                    this.connect()
                }, this.reconnectDelay)

                this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
            }
        }

        const events: SseEventType[] = [
            'connected',
            'APPOINTMENT_CREATED',
            'APPOINTMENT_CANCELED',
            'APPOINTMENT_STATUS_UPDATED',
        ]

        events.forEach(eventType => {
            this.es!.addEventListener(eventType, (e: MessageEvent) => {
                this.dispatch(eventType, e.data)
            })
        })
    }

    private dispatch(eventType: SseEventType, rawData: string) {
        const handlers = this.handlers.get(eventType)
        if (!handlers || handlers.size === 0) return

        if (eventType === 'connected') {
            handlers.forEach(h => h({ type: 'connected', data: {} }))
            return
        }

        try {
            // ✅ Parseia UMA única vez
            const parsed = JSON.parse(rawData)
            const payload: SsePayload = {
                type: eventType,
                data: parsed.data ?? parsed,
            }
            handlers.forEach(h => h(payload))
        } catch (err) {
            console.error('[SSE] Erro ao parsear evento:', eventType, rawData, err)
        }
    }

    on(event: SseEventType, handler: Handler): () => void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set())
        }
        this.handlers.get(event)!.add(handler)

        return () => {
            this.handlers.get(event)?.delete(handler)
        }
    }

    disconnect() {
        this.stopped = true
        this.closeEventSource()
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
    }

    reconnect() {
        this.stopped = false
        this.closeEventSource()
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
        this.connect()
    }

    private closeEventSource() {
        if (this.es) {
            this.es.close()
            this.es = null
        }
    }
}

export const sseService = new SseService()