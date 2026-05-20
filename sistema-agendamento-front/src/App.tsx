import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from 'sonner'

function App() {
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