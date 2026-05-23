import { useState } from 'react'

interface Props {
    value: number
    onChange?: (v: number) => void
    readonly?: boolean
    size?: number
}

export function StarRating({
                               value, onChange, readonly = false, size = 20,
                           }: Props) {
    const [hover, setHover] = useState(0)
    const active = hover || value

    return (
        <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    style={{
                        background: 'none', border: 'none',
                        cursor: readonly ? 'default' : 'pointer',
                        padding: 0, lineHeight: 1,
                        fontSize: size,
                        color: star <= active ? '#F59E0B' : 'var(--border)',
                        transition: 'color 0.1s',
                    }}
                    aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                >
                    ★
                </button>
            ))}
        </div>
    )
}