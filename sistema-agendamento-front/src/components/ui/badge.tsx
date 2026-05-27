export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted'

const configs: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    default: { bg: 'var(--bg-surface)', color: 'var(--text-secondary)', border: 'var(--border)' },
    success: { bg: 'var(--success-light)', color: '#065F46', border: '#A7F3D0' },
    danger: { bg: 'var(--danger-light)', color: '#991B1B', border: '#FECACA' },
    warning: { bg: 'var(--warning-light)', color: '#92400E', border: '#FDE68A' },
    info: { bg: 'var(--info-light)', color: '#1E40AF', border: '#BFDBFE' },
    muted: { bg: '#F4F4F5', color: 'var(--text-muted)', border: '#E4E4E7' },
}

interface BadgeProps {
    variant?: BadgeVariant
    children: React.ReactNode
    dot?: boolean
    style?: React.CSSProperties
}

export function Badge({ variant = 'default', children, dot, style }: BadgeProps) {
    const { bg, color, border } = configs[variant]
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
            padding: '3px 8px', borderRadius: 100,
            background: bg, color, border: `1px solid ${border}`,
            whiteSpace: 'nowrap', ...style,
        }}>
      {dot && (
          <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: color, flexShrink: 0,
          }} />
      )}
            {children}
    </span>
    )
}