import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { sseService } from '@/services/sseService'
import { filaService } from '@/services/filaService'
import { jobService } from '@/services/jobService'
import { funcionarioService } from '@/services/funcionarioService'
import { FilaEspera, FilaEsperaRequest } from '@/types/fila'
import { Job } from '@/types/job'
import { Funcionario } from '@/types/funcionario'
import { useAuthStore } from '@/store/authStore'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function FilaPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const [filas, setFilas] = useState<FilaEspera[]>([])
    const [jobs, setJobs] = useState<Job[]>([])
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState<{
        jobId: string
        date: string
        horarioPreferido: string
        funcionarioId: string
    }>({
        jobId: '', date: '', horarioPreferido: '', funcionarioId: '',
    })

    useEffect(() => {
        Promise.all([
            filaService.minhaFila(),
            jobService.getAll(),
            funcionarioService.getAtivos(),
        ]).then(([f, j, func]) => {
            setFilas(f)
            setJobs(j)
            setFuncionarios(func)
        }).finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        const unsub = sseService.on('FILA_VAGA_DISPONIVEL', (p) => {
            if (p.data?.userId !== user?.id) return
            filaService.minhaFila().then(setFilas)
        })
        return unsub
    }, [user?.id])

    const handleEntrar = async () => {
        if (!form.jobId || !form.date) {
            toast.error('Selecione serviço e data')
            return
        }
        setSubmitting(true)
        try {
            const req: FilaEsperaRequest = {
                jobId: Number(form.jobId),
                date: form.date,
                horarioPreferido: form.horarioPreferido || undefined,
                funcionarioId: form.funcionarioId
                    ? Number(form.funcionarioId) : undefined,
            }
            const nova = await filaService.entrar(req)
            setFilas(prev => [...prev, nova])
            setShowForm(false)
            setForm({ jobId: '', date: '', horarioPreferido: '', funcionarioId: '' })
            toast.success(`Você está na posição ${nova.posicao}ª da fila!`)
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'Erro ao entrar na fila')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSair = async (id: number) => {
        try {
            await filaService.sair(id)
            setFilas(prev => prev.filter(f => f.id !== id))
            toast.success('Saiu da fila')
        } catch {
            toast.error('Erro ao sair da fila')
        }
    }

    const inputStyle = {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '9px 12px',
        fontSize: 13, color: 'var(--text)', width: '100%', outline: 'none',
    }

    return (
        <div style={{ maxWidth: 600 }}>
            <div style={{
                background: '#FFFBEB', border: '1px solid #FDE68A',
                borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20,
            }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
                    ⏳ Como funciona a fila de espera
                </div>
                <div style={{ fontSize: 13, color: '#B45309', lineHeight: 1.5 }}>
                    Quando todos os horários de uma data estão ocupados, entre na fila.
                    Assim que alguém cancelar, você será notificado por email e pelo sistema.
                </div>
            </div>

            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
            }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {filas.length > 0
                        ? `Você está em ${filas.length} fila${filas.length > 1 ? 's' : ''}`
                        : 'Nenhuma fila de espera ativa'}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                        background: '#F59E0B', color: 'white',
                        fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                    }}
                >
                    <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} />
                    Entrar na fila
                </button>
            </div>

            {showForm && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px', marginBottom: 16,
                }}>
                    <div style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14,
                    }}>
                        Nova entrada na fila
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            {
                                label: 'Serviço *',
                                element: (
                                    <select
                                        value={form.jobId}
                                        onChange={e => setForm(p => ({ ...p, jobId: e.target.value }))}
                                        style={inputStyle}
                                    >
                                        <option value="">Selecione...</option>
                                        {jobs.map(j => (
                                            <option key={j.id} value={j.id}>{j.name}</option>
                                        ))}
                                    </select>
                                ),
                            },
                            {
                                label: 'Data *',
                                element: (
                                    <input
                                        type="date"
                                        value={form.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                        style={inputStyle}
                                    />
                                ),
                            },
                            {
                                label: 'Horário preferido (opcional)',
                                element: (
                                    <input
                                        type="time"
                                        value={form.horarioPreferido}
                                        onChange={e => setForm(p => ({ ...p, horarioPreferido: e.target.value }))}
                                        style={inputStyle}
                                    />
                                ),
                            },
                            ...(funcionarios.length > 0 ? [{
                                label: 'Profissional (opcional)',
                                element: (
                                    <select
                                        value={form.funcionarioId}
                                        onChange={e => setForm(p => ({ ...p, funcionarioId: e.target.value }))}
                                        style={inputStyle}
                                    >
                                        <option value="">Sem preferência</option>
                                        {funcionarios.map(f => (
                                            <option key={f.id} value={f.id}>{f.nome}</option>
                                        ))}
                                    </select>
                                ),
                            }] : []),
                        ].map(({ label, element }) => (
                            <div key={label}>
                                <label style={{
                                    fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                    display: 'block', marginBottom: 5,
                                }}>
                                    {label}
                                </label>
                                {element}
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <button
                                onClick={() => setShowForm(false)}
                                style={{
                                    flex: 1, padding: '9px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    background: 'var(--bg-surface)', color: 'var(--text-muted)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEntrar}
                                disabled={submitting}
                                style={{
                                    flex: 1, padding: '9px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    background: '#F59E0B', color: 'white', border: 'none',
                                    opacity: submitting ? 0.6 : 1,
                                }}
                            >
                                {submitting ? 'Entrando...' : 'Entrar na fila'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ padding: 20 }}>
                    {[...Array(2)].map((_, i) => (
                        <div key={i} style={{
                            height: 64, background: 'var(--bg-card)',
                            borderRadius: 'var(--radius)', marginBottom: 8,
                        }} />
                    ))}
                </div>
            ) : filas.length === 0 ? (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '48px 20px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                        Você não está em nenhuma fila de espera
                    </div>
                    <button
                        onClick={() => navigate('/appointments/new')}
                        style={{
                            marginTop: 12, padding: '8px 20px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--text)', color: 'white',
                            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                        }}
                    >
                        Fazer um agendamento
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filas.map(f => (
                        <div key={f.id} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '16px 20px',
                            display: 'flex', gap: 14, alignItems: 'center',
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: '#FEF3C7', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 700, color: '#92400E', flexShrink: 0,
                            }}>
                                {f.posicao}º
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                                    {f.jobName}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {format(parseISO(f.date), "dd 'de' MMMM", { locale: ptBR })}
                                    {f.horarioPreferido
                                        && ` · preferência ${f.horarioPreferido.slice(0, 5)}`}
                                    {f.funcionarioNome && ` · ${f.funcionarioNome}`}
                                </div>
                            </div>
                            <button
                                onClick={() => handleSair(f.id)}
                                style={{
                                    fontSize: 12, fontWeight: 600, color: 'var(--danger)',
                                    background: 'none', cursor: 'pointer',
                                    padding: '6px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--danger-light)',
                                }}
                            >
                                Sair da fila
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}