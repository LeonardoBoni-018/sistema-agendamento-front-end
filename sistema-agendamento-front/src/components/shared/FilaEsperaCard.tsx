import { useState } from 'react'
import { toast } from 'sonner'
import { filaService } from '@/services/filaService'
import { FilaEspera } from '@/types/fila'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
    filas: FilaEspera[]
    onSair: (id: number) => void
}

export function FilaEsperaCard({ filas, onSair }: Props) {
    const [loading, setLoading] = useState<number | null>(null)

    const handleSair = async (id: number) => {
        setLoading(id)
        try {
            await filaService.sair(id)
            toast.success('Saiu da fila de espera')
            onSair(id)
        } catch {
            toast.error('Erro ao sair da fila')
        } finally {
            setLoading(null)
        }
    }

    if (filas.length === 0) return null

    return (
        <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 'var(--radius)', padding: '14px 16px',
            marginBottom: 16,
        }}>
            <div style={{
                fontSize: 12, fontWeight: 700, color: '#92400E',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
            }}>
                ⏳ Fila de espera ({filas.length})
            </div>
            {filas.map(f => (
                <div key={f.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 0',
                    borderBottom: '1px solid #FDE68A',
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#FEF3C7', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#92400E', flexShrink: 0,
                    }}>
                        {f.posicao}º
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                            {f.jobName}
                        </div>
                        <div style={{ fontSize: 11, color: '#B45309' }}>
                            {format(parseISO(f.date), "dd 'de' MMM", { locale: ptBR })}
                            {f.horarioPreferido && ` · pref. ${f.horarioPreferido.slice(0, 5)}`}
                        </div>
                    </div>
                    <button
                        onClick={() => handleSair(f.id)}
                        disabled={loading === f.id}
                        style={{
                            fontSize: 11, fontWeight: 600, color: '#92400E',
                            background: 'none', border: 'none', cursor: 'pointer',
                            opacity: loading === f.id ? 0.5 : 1,
                        }}
                    >
                        Sair
                    </button>
                </div>
            ))}
        </div>
    )
}