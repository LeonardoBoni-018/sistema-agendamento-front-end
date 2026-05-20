import { useEffect } from 'react'
import { sseService, SseEventType, SsePayload } from '@/services/sseService'

export function useSse(
    event: SseEventType,
    handler: (payload: SsePayload) => void,
    deps: any[] = []
) {
    useEffect(() => {
        const unsubscribe = sseService.on(event, handler)
        return () => unsubscribe()
    }, deps)
}