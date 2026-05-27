import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean
    padding?: number | string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ children, hover, padding = '20px', style, ...props }, ref) => (
        <div
            ref={ref}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding,
                transition: hover ? 'all var(--transition)' : undefined,
                boxShadow: 'var(--shadow-sm)',
                ...style,
            }}
            onMouseEnter={hover ? e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.transform = 'translateY(-1px)'
            } : undefined}
            onMouseLeave={hover ? e => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
            } : undefined}
            {...props}
        >
            {children}
        </div>
    )
)
Card.displayName = 'Card'