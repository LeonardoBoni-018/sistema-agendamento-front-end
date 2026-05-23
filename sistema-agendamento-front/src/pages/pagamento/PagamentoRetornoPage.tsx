import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { pagamentoService } from '@/services/pagamentoService'
import { Pagamento } from '@/types/pagamento'

type Resultado = 'sucesso' | 'erro' | 'pendente'

export function PagamentoRetornoPage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const appointmentId = params.get('appointmentId')
    const [pagamento, setPagamento] = useState<Pagamento | null>(null)
    const [_, setLoading] = useState(true)

    const pathname = window.location.pathname
    const resultado: Resultado = pathname.includes('sucesso')
        ? 'sucesso'
        : pathname.includes('erro')
            ? 'erro'
            : 'pendente'

    useEffect(() => {
        if (appointmentId) {
            pagamentoService.getByAppointment(Number(appointmentId))
                .then(setPagamento)
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [appointmentId])

    const config = {
        sucesso: {
            icon: '✅',
            title: 'Pagamento aprovado!',
            desc: 'Seu agendamento foi confirmado com sucesso.',
            color: '#059669',
            bg: '#D1FAE5',
        },
        erro: {
            icon: '❌',
            title: 'Pagamento recusado',
            desc: 'Houve um problema com seu pagamento. Tente novamente.',
            color: '#DC2626',
            bg: '#FEE2E2',
        },
        pendente: {
            icon: '⏳',
            title: 'Pagamento em análise',
            desc: 'Seu pagamento está sendo processado. Você será notificado em breve.',
            color: '#D97706',
            bg: '#FEF3C7',
        },
    }[resultado]

    return (
        <div style={{
            minHeight: '100vh', background: '#F9FAFB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
            <div style={{
                background: 'white', borderRadius: 16,
                border: '1px solid #E5E7EB',
                padding: 32, maxWidth: 400, width: '100%', textAlign: 'center',
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: config.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, margin: '0 auto 16px',
                }}>
                    {config.icon}
                </div>
                <div style={{
                    fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8,
                }}>
                    {config.title}
                </div>
                <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
                    {config.desc}
                </div>

                {pagamento && (
                    <div style={{
                        background: '#F9FAFB', borderRadius: 8,
                        padding: '12px 16px', marginBottom: 20, textAlign: 'left',
                    }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: 13, marginBottom: 4,
                        }}>
                            <span style={{ color: '#6B7280' }}>Valor</span>
                            <span style={{ fontWeight: 600 }}>
                R$ {Number(pagamento.valor).toFixed(2)}
              </span>
                        </div>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', fontSize: 13,
                        }}>
                            <span style={{ color: '#6B7280' }}>Status</span>
                            <span style={{ fontWeight: 600, color: config.color }}>
                {pagamento.status}
              </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => navigate('/appointments')}
                    style={{
                        width: '100%', padding: '11px',
                        borderRadius: 8, background: '#1C1917',
                        color: 'white', fontSize: 14, fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                    }}
                >
                    Ver meus agendamentos
                </button>
            </div>
        </div>
    )
}