export type PagamentoStatus =
    | 'PENDENTE'
    | 'APROVADO'
    | 'REJEITADO'
    | 'CANCELADO'
    | 'REEMBOLSADO'

export interface Pagamento {
    id: number
    appointmentId: number
    valor: number
    status: PagamentoStatus
    checkoutUrl: string | null
    paidAt: string | null
}