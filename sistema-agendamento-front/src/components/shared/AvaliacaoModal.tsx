import { useState } from 'react'
import { toast } from 'sonner'
import { dashboardService } from '@/services/dashboardService'
import { Appointment } from '@/types/appointment'
import { StarRating } from './StarRating'

interface Props {
    appointment: Appointment
    onClose: () => void
    onSuccess: () => void
}

export function AvaliacaoModal({ appointment, onClose, onSuccess }: Props) {
    const [nota, setNota] = useState(0)
    const [comentario, setComentario] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (nota === 0) {
            toast.error('Selecione uma nota')
            return
        }
        setLoading(true)
        try {
            await dashboardService.avaliar(
                appointment.id, nota, comentario || undefined
            )
            toast.success('Avaliação enviada! Obrigado.')
            onSuccess()
            onClose()
        } catch {
            toast.error('Erro ao enviar avaliação')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
        }}
             onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 28, width: '100%', maxWidth: 420,
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
                    <div style={{
                        fontSize: 16, fontWeight: 600, color: 'var(--text)',
                        marginBottom: 4,
                    }}>
                        Como foi seu atendimento?
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {appointment.jobName}
                    </div>
                </div>

                <div style={{
                    display: 'flex', justifyContent: 'center', marginBottom: 20,
                }}>
                    <StarRating value={nota} onChange={setNota} size={36} />
                </div>

                {nota > 0 && (
                    <div style={{ marginBottom: 6 }}>
                        <div style={{
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            marginBottom: 6,
                        }}>
                            Comentário (opcional)
                        </div>
                        <textarea
                            value={comentario}
                            onChange={e => setComentario(e.target.value)}
                            placeholder="Conte como foi sua experiência..."
                            rows={3}
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '10px 12px', fontSize: 13,
                                color: 'var(--text)', width: '100%',
                                resize: 'none', outline: 'none',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        background: 'var(--bg-surface)', color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                    }}>
                        Agora não
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || nota === 0}
                        style={{
                            flex: 1, padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            background: nota > 0 ? 'var(--text)' : 'var(--border)',
                            color: 'white', border: 'none',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'Enviando...' : 'Enviar avaliação'}
                    </button>
                </div>
            </div>
        </div>
    )
}