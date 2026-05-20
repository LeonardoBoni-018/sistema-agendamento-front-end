import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from 'sonner'
import { sseService } from '@/services/sseService'
import { useAuthStore } from '@/store/authStore'

function App() {
    const token = useAuthStore(s => s.token)

    useEffect(() => {
        if (token) {
            sseService.connect()
        } else {
            sseService.disconnect()
        }
        return () => { sseService.disconnect() }
    }, [token])

    return (
        <>
            <AppRoutes />
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        fontSize: 13,
                        borderRadius: 8,
                    },
                }}
            />
        </>
    )
}

export default App