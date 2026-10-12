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
                
                
                ...style,
            }}
                        {...props}
        >
            {children}
        </div>
    )
)
Card.displayName = 'Card'