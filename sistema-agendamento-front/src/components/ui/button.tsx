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
            border: 'none',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition)',
            position: 'relative',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            userSelect: 'none',
        }

        const sizes = {
            sm: { fontSize: 13, padding: '6px 11px', borderRadius: 'var(--radius-sm)' },
            md: { fontSize: 14, padding: '8px 15px', borderRadius: 'var(--radius-sm)' },
            lg: { fontSize: 15, padding: '11px 20px', borderRadius: 'var(--radius-sm)' },
        }

        const variants: Record<string, React.CSSProperties> = {
            primary: {
                background: 'var(--accent)',
                color: 'var(--on-accent)',
                
            },
            secondary: {
                background: 'var(--bg-surface)',
                color: 'var(--text)',
                border: '1px solid var(--border-strong)',
            },
            ghost: {
                background: 'transparent',
                color: 'var(--text-secondary)',
            },
            danger: {
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                border: '1px solid var(--danger-light)',
            },
            warning: {
                background: 'var(--accent-light)',
                color: 'var(--accent-dark)',
                border: '1px solid var(--accent-light)',
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
                    if (variant === 'primary') el.style.background = 'var(--accent-hover)'
                    else if (variant === 'ghost') el.style.background = 'var(--bg-surface)'
                    else if (variant === 'secondary') el.style.borderColor = 'var(--text-muted)'
                }}
                onMouseLeave={e => {
                    if (disabled || loading) return
                    const el = e.currentTarget
                    el.style.opacity = '1'
                    if (variant === 'primary') el.style.background = 'var(--accent)'
                    if (variant === 'ghost') el.style.background = 'transparent'
                    if (variant === 'secondary') el.style.borderColor = 'var(--border-strong)'
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