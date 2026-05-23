import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { dashboardService } from '@/services/dashboardService'
import { Cliente } from '@/types/dashboard'
import { StarRating } from '@/components/shared/StarRating'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')
    const [detalhe, setDetalhe] = useState<Cliente | null>(null)

    useEffect(() => {
        dashboardService.getClientes()
            .then(setClientes)
            .catch(() => toast.error('Erro ao carregar clientes'))
            .finally(() => setLoading(false))
    }, [])

    const filtrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.email.toLowerCase().includes(busca.toLowerCase())
    )

    return (
        <div style={{ maxWidth: 900 }}>
            {detalhe && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: 16,
                }}
                     onClick={() => setDetalhe(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 28, width: '100%', maxWidth: 460,
                        }}
                    >
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            gap: 14, marginBottom: 20,
                        }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%',
                                background: 'var(--accent-light)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20, fontWeight: 600,
                                color: 'var(--accent-dark)', flexShrink: 0,
                            }}>
                                {detalhe.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                                    {detalhe.nome}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    {detalhe.email}
                                </div>
                            </div>
                            <button
                                onClick={() => setDetalhe(null)}
                                style={{
                                    marginLeft: 'auto', background: 'none',
                                    border: 'none', cursor: 'pointer',
                                    color: 'var(--text-muted)', fontSize: 18,
                                }}
                            >
                                <i className="ti ti-x" aria-hidden="true" />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                                { label: 'Telefone', value: detalhe.telefone ?? '—' },
                                { label: 'Total de agendamentos', value: String(detalhe.totalAgendamentos) },
                                { label: 'Finalizados', value: String(detalhe.agendamentosFinalizados) },
                                { label: 'Cancelados', value: String(detalhe.agendamentosCancelados) },
                                { label: 'Ticket total', value: `R$ ${Number(detalhe.ticketTotal).toFixed(2)}` },
                                { label: 'Ticket médio', value: `R$ ${Number(detalhe.ticketMedio).toFixed(2)}` },
                                { label: 'Serviço favorito', value: detalhe.servicoFavorito },
                                { label: 'Primeiro agendamento', value: detalhe.primeiroAgendamento
                                        ? format(parseISO(detalhe.primeiroAgendamento), "dd/MM/yyyy", { locale: ptBR })
                                        : '—' },
                                { label: 'Último agendamento', value: detalhe.ultimoAgendamento
                                        ? format(parseISO(detalhe.ultimoAgendamento), "dd/MM/yyyy", { locale: ptBR })
                                        : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', padding: '10px 0',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {label}
                  </span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {value}
                  </span>
                                </div>
                            ))}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', padding: '10px 0',
                            }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Avaliação média
                </span>
                                <StarRating
                                    value={Math.round(detalhe.mediaAvaliacao)}
                                    readonly
                                    size={16}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', padding: '9px 14px',
                        fontSize: 13, color: 'var(--text)', width: '100%',
                        maxWidth: 340, outline: 'none',
                    }}
                />
            </div>

            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: 20 }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{
                                height: 52, background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                            }} />
                        ))}
                    </div>
                ) : filtrados.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Nenhum cliente encontrado
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 80px 100px 100px 60px',
                            padding: '10px 20px', borderBottom: '1px solid var(--border)',
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                            <span>Cliente</span>
                            <span>Serviço favorito</span>
                            <span>Visits</span>
                            <span>Ticket médio</span>
                            <span>Avaliação</span>
                            <span></span>
                        </div>
                        {filtrados.map((c, idx) => (
                            <div key={c.userId} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 80px 100px 100px 60px',
                                padding: '13px 20px', alignItems: 'center',
                                borderBottom: idx < filtrados.length - 1
                                    ? '1px solid var(--border)' : 'none',
                                transition: 'background 0.1s',
                            }}
                                 onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                                 onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'var(--accent-light)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 12,
                                        fontWeight: 600, color: 'var(--accent-dark)',
                                        flexShrink: 0,
                                    }}>
                                        {c.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                            {c.nome}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                                            {c.email}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: 12, color: 'var(--text-muted)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {c.servicoFavorito}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                    {c.agendamentosFinalizados}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    R$ {Number(c.ticketMedio).toFixed(2)}
                                </div>
                                <StarRating
                                    value={Math.round(c.mediaAvaliacao)}
                                    readonly size={14}
                                />
                                <button
                                    onClick={() => setDetalhe(c)}
                                    style={{
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', color: 'var(--text-muted)',
                                        fontSize: 16, padding: 4,
                                    }}
                                    aria-label="Ver detalhes"
                                >
                                    <i className="ti ti-chevron-right" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}