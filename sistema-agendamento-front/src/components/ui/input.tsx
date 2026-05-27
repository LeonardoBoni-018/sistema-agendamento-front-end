import { InputHTMLAttributes, forwardRef, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, style, ...props }, ref) => {
        const [focused, setFocused] = useState(false)

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {label && (
                    <label style={{
                        fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>
                        {label}
                    </label>
                )}
                <div style={{ position: 'relative' }}>
                    {icon && (
                        <span style={{
                            position: 'absolute', left: 10, top: '50%',
                            transform: 'translateY(-50%)',
                            color: focused ? 'var(--accent)' : 'var(--text-muted)',
                            transition: 'color var(--transition)',
                            display: 'flex', alignItems: 'center',
                            pointerEvents: 'none',
                        }}>
              {icon}
            </span>
                    )}
                    <input
                        ref={ref}
                        style={{
                            width: '100%',
                            background: 'var(--bg-card)',
                            border: `1px solid ${error ? 'var(--danger)' : focused ? 'var(--text)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            padding: icon ? '9px 12px 9px 34px' : '9px 12px',
                            fontSize: 13,
                            color: 'var(--text)',
                            fontFamily: 'var(--font)',
                            outline: 'none',
                            transition: 'border-color var(--transition), box-shadow var(--transition)',
                            boxShadow: focused
                                ? `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.12)'}`
                                : 'var(--shadow-sm)',
                            ...style,
                        }}
                        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
                        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
                        {...props}
                    />
                </div>
                {error && (
                    <span style={{
                        fontSize: 11, color: 'var(--danger)',
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
            {error}
          </span>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'