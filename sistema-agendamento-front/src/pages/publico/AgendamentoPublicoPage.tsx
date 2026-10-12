import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { publicoService } from '@/services/publicoService'
import { ComercioPublico } from '@/types/publico'
import { Job } from '@/types/job'
import { Funcionario } from '@/types/funcionario'

const schema = z.object({
    nome: z.string().min(2, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    telefone: z.string().min(8, 'Telefone inválido'),
    senha: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

type Step = 'servico' | 'profissional' | 'data' | 'dados' | 'confirmado'

export function AgendamentoPublicoPage() {
    const { comercioId } = useParams<{ comercioId: string }>()
    const [comercio, setComercio] = useState<ComercioPublico | null>(null)
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<Step>('servico')

    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [selectedFuncionario, setSelectedFuncionario] =
        useState<Funcionario | null>(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [availableTimes, setAvailableTimes] = useState<string[]>([])
    const [loadingTimes, setLoadingTimes] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        if (!comercioId) return
        publicoService.getComercio(Number(comercioId))
            .then(setComercio)
            .catch(() => toast.error('Comércio não encontrado'))
            .finally(() => setLoading(false))
    }, [comercioId])

    useEffect(() => {
        if (!selectedDate || !selectedJob || !comercioId) return
        setLoadingTimes(true)
        setSelectedTime('')
        publicoService.getHorarios(
            Number(comercioId),
            selectedDate,
            selectedJob.id,
            selectedFuncionario?.id
        )
            .then(setAvailableTimes)
            .finally(() => setLoadingTimes(false))
    }, [selectedDate, selectedJob?.id, selectedFuncionario?.id])

    const onSubmit = async (data: FormData) => {
        if (!selectedJob || !selectedDate || !selectedTime || !comercioId) return
        setSubmitting(true)
        try {
            await publicoService.agendar(Number(comercioId), {
                jobId: selectedJob.id,
                date: selectedDate,
                time: selectedTime,
                funcionarioId: selectedFuncionario?.id,
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                senha: data.senha || undefined,
            })
            setStep('confirmado')
        } catch {
            toast.error('Erro ao criar agendamento. Tente outro horário.')
        } finally {
            setSubmitting(false)
        }
    }

    const inputStyle = {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px',
        fontSize: 14, color: 'var(--text)', width: '100%', outline: 'none',
        fontFamily: 'inherit',
    }

    const btnPrimary = {
        background: 'var(--text)', color: 'var(--on-strong)',
        border: 'none', borderRadius: 8,
        padding: '11px 24px', fontSize: 14,
        fontWeight: 600, cursor: 'pointer',
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Carregando...</div>
            </div>
        )
    }

    if (!comercio) {
        return (
            <div style={{
                minHeight: '100vh', background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>😕</div>
                    <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                        Comércio não encontrado
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-surface)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
            {/* Header */}
            <div style={{
                background: 'var(--text)', padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 14,
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--accent)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'var(--on-strong)', flexShrink: 0,
                }}>
                    {comercio.nome.charAt(0)}
                </div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-strong)' }}>
                        {comercio.nome}
                    </div>
                    {comercio.endereco && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {comercio.endereco}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px' }}>

                {step === 'confirmado' ? (
                    <div style={{
                        background: 'var(--bg-card)', borderRadius: 12,
                        border: '1px solid var(--border)',
                        padding: 32, textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                        <div style={{
                            fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8,
                        }}>
                            Agendamento realizado!
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                            Você receberá uma confirmação por email em breve.
                        </div>
                        <div style={{
                            background: 'var(--bg-surface)', borderRadius: 8, padding: '16px 20px',
                            textAlign: 'left', marginBottom: 20,
                        }}>
                            {[
                                { label: 'Serviço', value: selectedJob?.name },
                                { label: 'Data', value: selectedDate },
                                { label: 'Horário', value: selectedTime?.slice(0, 5) },
                                ...(selectedFuncionario
                                    ? [{ label: 'Profissional', value: selectedFuncionario.nome }]
                                    : []),
                            ].map(({ label, value }) => (
                                <div key={label} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '6px 0', borderBottom: '1px solid var(--border)',
                                }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {value}
                  </span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setStep('servico')
                                setSelectedJob(null)
                                setSelectedFuncionario(null)
                                setSelectedDate('')
                                setSelectedTime('')
                            }}
                            style={{ ...btnPrimary, width: '100%' }}
                        >
                            Fazer outro agendamento
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Steps indicator */}
                        <div style={{
                            display: 'flex', gap: 6, marginBottom: 24,
                        }}>
                            {(['servico', 'profissional', 'data', 'dados'] as Step[]).map((s, i) => (
                                <div key={s} style={{
                                    height: 4, flex: 1, borderRadius: 2,
                                    background: ['servico', 'profissional', 'data', 'dados']
                                        .indexOf(step) >= i ? 'var(--text)' : 'var(--border)',
                                    transition: 'background 0.2s',
                                }} />
                            ))}
                        </div>

                        {/* Step 1 — Serviço */}
                        {step === 'servico' && (
                            <div>
                                <div style={{
                                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em',
                                    marginBottom: 12,
                                }}>
                                    Escolha o serviço
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {comercio.servicos.map(job => (
                                        <button
                                            key={job.id}
                                            onClick={() => {
                                                setSelectedJob(job)
                                                setStep(comercio.funcionarios.length > 0
                                                    ? 'profissional' : 'data')
                                            }}
                                            style={{
                                                background: selectedJob?.id === job.id
                                                    ? 'var(--success-light)' : 'white',
                                                border: `1px solid ${selectedJob?.id === job.id
                                                    ? 'var(--success)' : 'var(--border)'}`,
                                                borderRadius: 10, padding: '14px 16px',
                                                textAlign: 'left', cursor: 'pointer',
                                                display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'center', transition: 'all 0.15s',
                                            }}
                                        >
                                            <div>
                                                <div style={{
                                                    fontSize: 14, fontWeight: 600, color: 'var(--text)',
                                                }}>
                                                    {job.name}
                                                </div>
                                                {job.description && (
                                                    <div style={{
                                                        fontSize: 12, color: 'var(--text-muted)', marginTop: 2,
                                                    }}>
                                                        {job.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                                                <div style={{
                                                    fontSize: 14, fontWeight: 700, color: 'var(--text)',
                                                }}>
                                                    R$ {Number(job.price).toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                    {job.durationMinutes}min
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2 — Profissional */}
                        {step === 'profissional' && comercio.funcionarios.length > 0 && (
                            <div>
                                <div style={{
                                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em',
                                    marginBottom: 12,
                                }}>
                                    Escolha o profissional (opcional)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <button
                                        onClick={() => {
                                            setSelectedFuncionario(null)
                                            setStep('data')
                                        }}
                                        style={{
                                            background: !selectedFuncionario ? 'var(--bg-surface)' : 'white',
                                            border: `1px solid ${!selectedFuncionario
                                                ? 'var(--text)' : 'var(--border)'}`,
                                            borderRadius: 10, padding: '12px 16px',
                                            textAlign: 'left', cursor: 'pointer',
                                            fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
                                        }}
                                    >
                                        Sem preferência
                                    </button>
                                    {comercio.funcionarios.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => {
                                                setSelectedFuncionario(f)
                                                setStep('data')
                                            }}
                                            style={{
                                                background: selectedFuncionario?.id === f.id
                                                    ? 'var(--bg-surface)' : 'white',
                                                border: `1px solid ${selectedFuncionario?.id === f.id
                                                    ? 'var(--text)' : 'var(--border)'}`,
                                                borderRadius: 10, padding: '12px 16px',
                                                textAlign: 'left', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 10,
                                            }}
                                        >
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                background: 'var(--accent-light)',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 14, fontWeight: 700, color: 'var(--accent-dark)',
                                                flexShrink: 0,
                                            }}>
                                                {f.nome.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                                }}>
                                                    {f.nome}
                                                </div>
                                                {f.especialidade && (
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                        {f.especialidade}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setStep('servico')}
                                    style={{
                                        marginTop: 16, background: 'none', border: 'none',
                                        cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)',
                                    }}
                                >
                                    ← Voltar
                                </button>
                            </div>
                        )}

                        {/* Step 3 — Data e horário */}
                        {step === 'data' && (
                            <div>
                                <div style={{
                                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em',
                                    marginBottom: 12,
                                }}>
                                    Escolha data e horário
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <label style={{
                                        fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                                        display: 'block', marginBottom: 6,
                                    }}>
                                        Data
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        style={{ ...inputStyle, maxWidth: 200 }}
                                    />
                                </div>

                                {selectedDate && (
                                    <div>
                                        <label style={{
                                            fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                                            display: 'block', marginBottom: 8,
                                        }}>
                                            Horários disponíveis
                                        </label>
                                        {loadingTimes ? (
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                                Carregando horários...
                                            </div>
                                        ) : availableTimes.length === 0 ? (
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                                Nenhum horário disponível nesta data
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {availableTimes.map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setSelectedTime(t)}
                                                        style={{
                                                            padding: '8px 14px',
                                                            borderRadius: 8, fontSize: 13,
                                                            fontWeight: 500, cursor: 'pointer',
                                                            background: selectedTime === t
                                                                ? 'var(--text)' : 'white',
                                                            color: selectedTime === t ? 'var(--on-strong)' : 'var(--text-secondary)',
                                                            border: `1px solid ${selectedTime === t
                                                                ? 'var(--text)' : 'var(--border)'}`,
                                                            transition: 'all 0.12s',
                                                        }}
                                                    >
                                                        {t?.slice(0, 5)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedDate && selectedTime && (
                                    <button
                                        onClick={() => setStep('dados')}
                                        style={{ ...btnPrimary, marginTop: 20, width: '100%' }}
                                    >
                                        Continuar →
                                    </button>
                                )}

                                <button
                                    onClick={() => setStep(
                                        comercio.funcionarios.length > 0
                                            ? 'profissional' : 'servico'
                                    )}
                                    style={{
                                        marginTop: 12, background: 'none', border: 'none',
                                        cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)',
                                        display: 'block',
                                    }}
                                >
                                    ← Voltar
                                </button>
                            </div>
                        )}

                        {/* Step 4 — Dados pessoais */}
                        {step === 'dados' && (
                            <div>
                                <div style={{
                                    fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em',
                                    marginBottom: 4,
                                }}>
                                    Seus dados
                                </div>
                                <div style={{
                                    fontSize: 12, color: 'var(--text-muted)', marginBottom: 16,
                                }}>
                                    Já tem conta? Use o mesmo email para vincular ao seu perfil.
                                </div>

                                {/* Resumo */}
                                <div style={{
                                    background: 'var(--bg-surface)', borderRadius: 8, padding: 14,
                                    marginBottom: 20, fontSize: 13,
                                }}>
                                    <div style={{
                                        fontWeight: 600, color: 'var(--text)', marginBottom: 6,
                                    }}>
                                        {selectedJob?.name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        {selectedDate} às {selectedTime?.slice(0, 5)}
                                        {selectedFuncionario && ` · ${selectedFuncionario.nome}`}
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                                >
                                    {[
                                        { name: 'nome' as const, label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
                                        { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'seu@email.com' },
                                        { name: 'telefone' as const, label: 'Telefone', type: 'tel', placeholder: '(11) 99999-9999' },
                                        { name: 'senha' as const, label: 'Criar senha (opcional)', type: 'password', placeholder: 'Para acessar o sistema' },
                                    ].map(({ name, label, type, placeholder }) => (
                                        <div key={name}>
                                            <label style={{
                                                fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em',
                                                display: 'block', marginBottom: 6,
                                            }}>
                                                {label}
                                            </label>
                                            <input
                                                {...register(name)}
                                                type={type}
                                                placeholder={placeholder}
                                                style={inputStyle}
                                            />
                                            {errors[name] && (
                                                <span style={{
                                                    fontSize: 11, color: 'var(--danger)', marginTop: 3,
                                                    display: 'block',
                                                }}>
                          {errors[name]?.message}
                        </span>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        style={{
                                            ...btnPrimary, width: '100%',
                                            opacity: submitting ? 0.6 : 1, marginTop: 4,
                                        }}
                                    >
                                        {submitting ? 'Agendando...' : 'Confirmar agendamento'}
                                    </button>
                                </form>

                                <button
                                    onClick={() => setStep('data')}
                                    style={{
                                        marginTop: 12, background: 'none', border: 'none',
                                        cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)',
                                    }}
                                >
                                    ← Voltar
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}