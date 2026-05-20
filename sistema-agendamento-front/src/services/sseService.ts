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

type SseHandler = (payload: SsePayload) => void

class SseService {
    private es: EventSource | null = null
    private handlers: Map<SseEventType, Set<SseHandler>> = new Map()
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null
    private reconnectDelay = 3000
    private isConnecting = false

    connect() {
        const token = useAuthStore.getState().token

        console.log('[SSE] Tentando conectar, token:', !!token, 'es:', !!this.es, 'isConnecting:', this.isConnecting)

        if (!token || this.es || this.isConnecting) return

        this.isConnecting = true
        const url = `http://localhost:8080/v1/events/stream`

        try {
            this.es = new EventSource(`${url}?token=${token}`)

            this.es.onopen = () => {
                console.log('[SSE] ✅ Conectado com sucesso')
                this.reconnectDelay = 3000
                this.isConnecting = false
            }

            this.es.onerror = (e) => {
                console.error('[SSE] ❌ Erro na conexão:', e)
                this.isConnecting = false
                this.disconnect()
                this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay)
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
            }

            const eventTypes: SseEventType[] = [
                'connected',
                'APPOINTMENT_CREATED',
                'APPOINTMENT_CANCELED',
                'APPOINTMENT_STATUS_UPDATED',
                'JOB_CREATED',
                'JOB_UPDATED',
                'JOB_DELETED',
            ]

            eventTypes.forEach(eventType => {
                this.es!.addEventListener(eventType, (e: MessageEvent) => {
                    console.log(`[SSE] 📥 Evento recebido: ${eventType}`, e.data)
                    try {
                        const handlers = this.handlers.get(eventType)
                        if (!handlers) {
                            console.log(`[SSE] ⚠️ Sem handlers para: ${eventType}`)
                            return
                        }

                        let data = e.data
                        let parsed: SsePayload

                        if (eventType === 'connected') {
                            parsed = { type: 'connected', data: {} }
                        } else {
                            const inner = JSON.parse(data)
                            parsed = { type: eventType, data: JSON.parse(inner) }
                        }

                        console.log(`[SSE] 📤 Enviando para ${handlers.size} handlers:`, parsed)
                        handlers.forEach(h => h(parsed))
                    } catch (err) {
                        console.error('[SSE] Erro ao parsear evento:', err)
                    }
                })
            })
        } catch (err) {
            console.error('[SSE] Erro ao criar EventSource:', err)
            this.isConnecting = false
        }
    }

    on(event: SseEventType, handler: SseHandler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set())
        }
        this.handlers.get(event)!.add(handler)
        console.log(`[SSE] Handler registrado para: ${event}, total handlers:`, this.handlers.get(event)?.size)

        return () => this.off(event, handler)
    }

    off(event: SseEventType, handler: SseHandler) {
        this.handlers.get(event)?.delete(handler)
    }

    disconnect() {
        if (this.es) {
            this.es.close()
            this.es = null
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }
    }
}

export const sseService = new SseService()