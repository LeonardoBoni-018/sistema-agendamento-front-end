import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { filaService } from '@/services/filaService'
import { FilaEspera } from '@/types/fila'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function FilaAdminPage() {
    const [filas, setFilas] = useState<FilaEspera[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        filaService.filaDoComercio()
            .then(setFilas)
            .catch(() => toast.error('Erro ao carregar fila'))
            .finally(() => setLoading(false))
    }, [])

    const grouped = filas.reduce((acc, f) => {
        const key = f.date
        if (!acc[key]) acc[key] = []
        acc[key].push(f)
        return acc
    }, {} as Record<string, FilaEspera[]>)

    return (
        <div style={{ maxWidth: 720 }}>
            {loading ? (
                <div style={{ padding: 20 }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} style={{
                            height: 56, background: 'var(--bg-card)',
                            borderRadius: 'var(--radius)', marginBottom: 8,
                        }} />
                    ))}
                </div>
            ) : filas.length === 0 ? (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '60px 20px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                        Nenhum cliente na fila de espera
                    </div>
                </div>
            ) : (
                Object.entries(grouped)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, items]) => (
                        <div key={date} style={{ marginBottom: 16 }}>
                            <div style={{
                                fontSize: 11, fontWeight: 700, color: 'var(--text-faint)',
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                                marginBottom: 8,
                            }}>
                                {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            </div>
                            <div style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', overflow: 'hidden',
                            }}>
                                {items.map((f, idx) => (
                                    <div key={f.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '13px 20px',
                                        borderBottom: idx < items.length - 1
                                            ? '1px solid var(--border)' : 'none',
                                    }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: '#FEF3C7',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: 11,
                                            fontWeight: 700, color: '#92400E', flexShrink: 0,
                                        }}>
                                            {f.posicao}º
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                            }}>
                                                {f.userName}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                                                {f.jobName}
                                                {f.horarioPreferido
                                                    && ` · pref. ${f.horarioPreferido.slice(0, 5)}`}
                                                {f.funcionarioNome && ` · ${f.funcionarioNome}`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
            )}
        </div>
    )
}