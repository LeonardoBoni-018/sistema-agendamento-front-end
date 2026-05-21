import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { dashboardService } from '@/services/dashboardService'
import { Avaliacao } from '@/types/dashboard'
import { StarRating } from '@/components/shared/StarRating'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function AvaliacoesPage() {
    const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
    const [loading, setLoading] = useState(true)
    const [filtroNota, setFiltroNota] = useState<number | 0>(0)

    useEffect(() => {
        dashboardService.getAvaliacoes()
            .then(setAvaliacoes)
            .catch(() => toast.error('Erro ao carregar avaliações'))
            .finally(() => setLoading(false))
    }, [])

    const media = avaliacoes.length > 0
        ? avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length
        : 0

    const distribuicao = [5, 4, 3, 2, 1].map(nota => ({
        nota,
        qty: avaliacoes.filter(a => a.nota === nota).length,
    }))

    const filtradas = filtroNota
        ? avaliacoes.filter(a => a.nota === filtroNota)
        : avaliacoes

    return (
        <div style={{ maxWidth: 720 }}>
            {/* Resumo */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '20px 24px',
                marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 40, fontWeight: 500, color: 'var(--text)', lineHeight: 1 }}>
                        {media > 0 ? media.toFixed(1) : '—'}
                    </div>
                    <StarRating value={Math.round(media)} readonly size={18} />
                    <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>
                        {avaliacoes.length} avaliações
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    {distribuicao.map(({ nota, qty }) => (
                        <div key={nota} style={{
                            display: 'flex', alignItems: 'center',
                            gap: 8, marginBottom: 5, cursor: 'pointer',
                        }}
                             onClick={() => setFiltroNota(filtroNota === nota ? 0 : nota)}
                        >
              <span style={{
                  fontSize: 12, color: 'var(--text-muted)',
                  minWidth: 8, fontWeight: filtroNota === nota ? 700 : 400,
              }}>
                {nota}★
              </span>
                            <div style={{
                                flex: 1, height: 6,
                                background: 'var(--bg-surface)', borderRadius: 3,
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: avaliacoes.length > 0
                                        ? `${(qty / avaliacoes.length) * 100}%` : '0%',
                                    background: filtroNota === nota
                                        ? '#F59E0B' : 'var(--text)',
                                    borderRadius: 3, transition: 'width 0.4s ease',
                                }} />
                            </div>
                            <span style={{
                                fontSize: 11, color: 'var(--text-faint)', minWidth: 20,
                            }}>
                {qty}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            {filtroNota > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 12,
                }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Filtrando por {filtroNota} estrela{filtroNota > 1 ? 's' : ''}
          </span>
                    <button
                        onClick={() => setFiltroNota(0)}
                        style={{
                            fontSize: 11, color: 'var(--danger)',
                            background: 'none', border: 'none', cursor: 'pointer',
                        }}
                    >
                        Limpar
                    </button>
                </div>
            )}

            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: 20 }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{
                                height: 80, background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                            }} />
                        ))}
                    </div>
                ) : filtradas.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>⭐</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Nenhuma avaliação ainda
                        </div>
                    </div>
                ) : (
                    filtradas.map((a, idx) => (
                        <div key={a.id} style={{
                            padding: '16px 20px',
                            borderBottom: idx < filtradas.length - 1
                                ? '1px solid var(--border)' : 'none',
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'flex-start', marginBottom: 6,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '50%',
                                        background: 'var(--accent-light)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 11,
                                        fontWeight: 600, color: 'var(--accent-dark)',
                                        flexShrink: 0,
                                    }}>
                                        {a.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                        }}>
                                            {a.userName}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                                            {a.jobName}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <StarRating value={a.nota} readonly size={14} />
                                    <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>
                                        {a.createdAt ? format(parseISO(a.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '—'}
                                    </div>
                                </div>
                            </div>
                            {a.comentario && (
                                <div style={{
                                    fontSize: 13, color: 'var(--text-muted)',
                                    lineHeight: 1.5, padding: '8px 12px',
                                    background: 'var(--bg-surface)',
                                    borderRadius: 'var(--radius-sm)',
                                    borderLeft: '3px solid var(--border)',
                                }}>
                                    "{a.comentario}"
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}