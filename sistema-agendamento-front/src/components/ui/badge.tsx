export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted'

const tone = (c: string) => ({
    bg: `var(--${c}-light)`,
    color: `var(--${c})`,
    border: `color-mix(in srgb, var(--${c}) 28%, transparent)`,
})

const configs: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    default: { bg: 'var(--bg-surface)', color: 'var(--text-secondary)', border: 'var(--border)' },
    success: tone('success'),
    danger: tone('danger'),
    warning: tone('warning'),
    info: tone('info'),
    muted: { bg: 'var(--bg-surface)', color: 'var(--text-muted)', border: 'var(--border)' },
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
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)',
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