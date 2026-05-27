import { useEffect } from 'react'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from 'sonner'
import { sseService } from '@/services/sseService'
import { useAuthStore } from '@/store/authStore'

function App() {
    const token = useAuthStore(s => s.token)

    useEffect(() => {
        if (token) sseService.reconnect()
        else sseService.disconnect()
        return () => sseService.disconnect()
    }, [token])

    return (
        <>
            <AppRoutes />
            <Toaster
                position="bottom-right"
                gap={8}
                toastOptions={{
                    style: {
                        fontFamily: 'var(--font)',
                        fontSize: 13,
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-xl)',
                        background: 'var(--bg-card)',
                        color: 'var(--text)',
                    },
                    classNames: {
                        title: 'font-semibold',
                    },
                }}
            />
        </>
    )
}

export default App