import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const dark = resolvedTheme !== 'light'

    return (
        <button
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                transition: 'all var(--transition)',
            }}
        >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
    )
}
