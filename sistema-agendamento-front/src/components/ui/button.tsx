import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
         variant = 'primary', size = 'md', loading, icon, children,
         className, style, disabled, ...props
     }, ref) => {
        const base: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontFamily: 'var(--font)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            border: 'none',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition)',
            position: 'relative',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            userSelect: 'none',
        }

        const sizes = {
            sm: { fontSize: 12, padding: '5px 10px', borderRadius: 'var(--radius-xs)' },
            md: { fontSize: 13, padding: '8px 14px', borderRadius: 'var(--radius-sm)' },
            lg: { fontSize: 14, padding: '11px 20px', borderRadius: 'var(--radius)' },
        }

        const variants: Record<string, React.CSSProperties> = {
            primary: {
                background: 'var(--text)',
                color: '#fff',
                boxShadow: 'var(--shadow-sm)',
            },
            secondary: {
                background: 'var(--bg-surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
            },
            ghost: {
                background: 'transparent',
                color: 'var(--text-secondary)',
            },
            danger: {
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                border: '1px solid #FECACA',
            },
            warning: {
                background: 'var(--accent-light)',
                color: 'var(--accent-dark)',
                border: '1px solid #FDE68A',
            },
        }

        return (
            <button
                ref={ref}
                style={{
                    ...base,
                    ...sizes[size],
                    ...variants[variant],
                    opacity: disabled || loading ? 0.5 : 1,
                    ...style,
                }}
                disabled={disabled || loading}
                onMouseEnter={e => {
                    if (disabled || loading) return
                    const el = e.currentTarget
                    if (variant === 'primary') el.style.opacity = '0.88'
                    else if (variant === 'ghost') el.style.background = 'var(--bg-surface)'
                    else if (variant === 'secondary') el.style.borderColor = 'var(--border-strong)'
                }}
                onMouseLeave={e => {
                    if (disabled || loading) return
                    const el = e.currentTarget
                    el.style.opacity = '1'
                    if (variant === 'ghost') el.style.background = 'transparent'
                    if (variant === 'secondary') el.style.borderColor = 'var(--border)'
                }}
                onMouseDown={e => {
                    if (disabled || loading) return
                    e.currentTarget.style.transform = 'scale(0.98)'
                }}
                onMouseUp={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                }}
                {...props}
            >
                {loading ? (
                    <span style={{
                        width: 14, height: 14, border: '2px solid currentColor',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite', display: 'inline-block',
                    }} />
                ) : icon}
                {children}
            </button>
        )
    }
)
Button.displayName = 'Button'