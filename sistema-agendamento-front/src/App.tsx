import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from 'sonner'

function App() {
  return (
      <>
        <AppRoutes />
        <Toaster richColors theme="dark" position="top-right" />
      </>
  )
}

export default App