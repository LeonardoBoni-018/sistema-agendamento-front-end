import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { pagamentoService } from '@/services/pagamentoService'
import { Pagamento, PagamentoStatus } from '@/types/pagamento'
import { Appointment } from '@/types/appointment'

interface Props {
    appointment: Appointment
}

const statusConfig: Record<PagamentoStatus, { label: string; color: string; bg: string }> = {
    PENDENTE: { label: 'Aguardando pagamento', color: '#92400E', bg: '#FEF3C7' },
    APROVADO: { label: 'Pago ✅', color: '#065F46', bg: '#D1FAE5' },
    REJEITADO: { label: 'Pagamento recusado', color: '#991B1B', bg: '#FEE2E2' },
    CANCELADO: { label: 'Cancelado', color: '#6B7280', bg: '#F3F4F6' },
    REEMBOLSADO: { label: 'Reembolsado', color: '#1E40AF', bg: '#DBEAFE' },
}

export function PagamentoCard({ appointment }: Props) {
    const [pagamento, setPagamento] = useState<Pagamento | null>(null)
    // const [loading, setLoading] = useState(false)
    const [gerando, setGerando] = useState(false)

    useEffect(() => {
        pagamentoService.getByAppointment(appointment.id)
            .then(setPagamento)
    }, [appointment.id])

    const handlePagar = async () => {
        setGerando(true)
        try {
            const p = await pagamentoService.gerarCheckout(appointment.id)
            setPagamento(p)
            if (p.checkoutUrl) window.open(p.checkoutUrl, '_blank')
        } catch {
            toast.error('Erro ao gerar link de pagamento')
        } finally {
            setGerando(false)
        }
    }

    if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
        return null
    }

    const status = pagamento ? statusConfig[pagamento.status] : null

    return (
        <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            marginTop: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 8,
        }}>
            <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                    Pagamento antecipado
                </div>
                {pagamento ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{
                fontSize: 11, fontWeight: 600,
                color: status!.color, background: status!.bg,
                padding: '2px 8px', borderRadius: 10,
            }}>
              {status!.label}
            </span>
                        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              R$ {Number(pagamento.valor).toFixed(2)}
            </span>
                    </div>
                ) : (
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                        R$ {Number(appointment.jobPrice).toFixed(2)}
                    </div>
                )}
            </div>

            {(!pagamento || pagamento.status === 'REJEITADO') && (
                <button
                    onClick={handlePagar}
                    disabled={gerando}
                    style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--text)', color: 'white',
                        fontSize: 11, fontWeight: 600, border: 'none',
                        cursor: 'pointer', flexShrink: 0,
                        opacity: gerando ? 0.6 : 1,
                    }}
                >
                    {gerando ? '...' : '💳 Pagar'}
                </button>
            )}

            {pagamento?.status === 'PENDENTE' && pagamento.checkoutUrl && (
                <button
                    onClick={() => window.open(pagamento.checkoutUrl!, '_blank')}
                    style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                        background: '#009EE3', color: 'white',
                        fontSize: 11, fontWeight: 600, border: 'none',
                        cursor: 'pointer', flexShrink: 0,
                    }}
                >
                    Continuar pagamento
                </button>
            )}
        </div>
    )
}