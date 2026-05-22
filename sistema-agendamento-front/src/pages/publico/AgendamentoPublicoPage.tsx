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
        background: '#F9FAFB', border: '1px solid #E5E7EB',
        borderRadius: 8, padding: '10px 14px',
        fontSize: 14, color: '#111827', width: '100%', outline: 'none',
        fontFamily: 'inherit',
    }

    const btnPrimary = {
        background: '#1C1917', color: 'white',
        border: 'none', borderRadius: 8,
        padding: '11px 24px', fontSize: 14,
        fontWeight: 600, cursor: 'pointer',
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', background: '#F9FAFB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ fontSize: 14, color: '#6B7280' }}>Carregando...</div>
            </div>
        )
    }

    if (!comercio) {
        return (
            <div style={{
                minHeight: '100vh', background: '#F9FAFB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>😕</div>
                    <div style={{ fontSize: 16, color: '#374151' }}>
                        Comércio não encontrado
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#F9FAFB',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
            {/* Header */}
            <div style={{
                background: '#1C1917', padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 14,
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: '#D97706', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                    {comercio.nome.charAt(0)}
                </div>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>
                        {comercio.nome}
                    </div>
                    {comercio.endereco && (
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                            {comercio.endereco}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px' }}>

                {step === 'confirmado' ? (
                    <div style={{
                        background: 'white', borderRadius: 12,
                        border: '1px solid #E5E7EB',
                        padding: 32, textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                        <div style={{
                            fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8,
                        }}>
                            Agendamento realizado!
                        </div>
                        <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
                            Você receberá uma confirmação por email em breve.
                        </div>
                        <div style={{
                            background: '#F9FAFB', borderRadius: 8, padding: '16px 20px',
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
                                    padding: '6px 0', borderBottom: '1px solid #E5E7EB',
                                }}>
                                    <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
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
                                        .indexOf(step) >= i ? '#1C1917' : '#E5E7EB',
                                    transition: 'background 0.2s',
                                }} />
                            ))}
                        </div>

                        {/* Step 1 — Serviço */}
                        {step === 'servico' && (
                            <div>
                                <div style={{
                                    fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
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
                                                    ? '#F0FDF4' : 'white',
                                                border: `1px solid ${selectedJob?.id === job.id
                                                    ? '#059669' : '#E5E7EB'}`,
                                                borderRadius: 10, padding: '14px 16px',
                                                textAlign: 'left', cursor: 'pointer',
                                                display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'center', transition: 'all 0.15s',
                                            }}
                                        >
                                            <div>
                                                <div style={{
                                                    fontSize: 14, fontWeight: 600, color: '#111827',
                                                }}>
                                                    {job.name}
                                                </div>
                                                {job.description && (
                                                    <div style={{
                                                        fontSize: 12, color: '#6B7280', marginTop: 2,
                                                    }}>
                                                        {job.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                                                <div style={{
                                                    fontSize: 14, fontWeight: 700, color: '#111827',
                                                }}>
                                                    R$ {Number(job.price).toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#9CA3AF' }}>
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
                                    fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
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
                                            background: !selectedFuncionario ? '#F9FAFB' : 'white',
                                            border: `1px solid ${!selectedFuncionario
                                                ? '#1C1917' : '#E5E7EB'}`,
                                            borderRadius: 10, padding: '12px 16px',
                                            textAlign: 'left', cursor: 'pointer',
                                            fontSize: 13, color: '#374151', fontWeight: 500,
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
                                                    ? '#F9FAFB' : 'white',
                                                border: `1px solid ${selectedFuncionario?.id === f.id
                                                    ? '#1C1917' : '#E5E7EB'}`,
                                                borderRadius: 10, padding: '12px 16px',
                                                textAlign: 'left', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 10,
                                            }}
                                        >
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                background: '#FEF3C7',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 14, fontWeight: 700, color: '#92400E',
                                                flexShrink: 0,
                                            }}>
                                                {f.nome.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: 13, fontWeight: 600, color: '#111827',
                                                }}>
                                                    {f.nome}
                                                </div>
                                                {f.especialidade && (
                                                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>
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
                                        cursor: 'pointer', fontSize: 13, color: '#6B7280',
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
                                    fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                    marginBottom: 12,
                                }}>
                                    Escolha data e horário
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <label style={{
                                        fontSize: 12, fontWeight: 600, color: '#6B7280',
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
                                            fontSize: 12, fontWeight: 600, color: '#6B7280',
                                            display: 'block', marginBottom: 8,
                                        }}>
                                            Horários disponíveis
                                        </label>
                                        {loadingTimes ? (
                                            <div style={{ fontSize: 13, color: '#9CA3AF' }}>
                                                Carregando horários...
                                            </div>
                                        ) : availableTimes.length === 0 ? (
                                            <div style={{ fontSize: 13, color: '#9CA3AF' }}>
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
                                                                ? '#1C1917' : 'white',
                                                            color: selectedTime === t ? 'white' : '#374151',
                                                            border: `1px solid ${selectedTime === t
                                                                ? '#1C1917' : '#E5E7EB'}`,
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
                                        cursor: 'pointer', fontSize: 13, color: '#6B7280',
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
                                    fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                    marginBottom: 4,
                                }}>
                                    Seus dados
                                </div>
                                <div style={{
                                    fontSize: 12, color: '#9CA3AF', marginBottom: 16,
                                }}>
                                    Já tem conta? Use o mesmo email para vincular ao seu perfil.
                                </div>

                                {/* Resumo */}
                                <div style={{
                                    background: '#F9FAFB', borderRadius: 8, padding: 14,
                                    marginBottom: 20, fontSize: 13,
                                }}>
                                    <div style={{
                                        fontWeight: 600, color: '#111827', marginBottom: 6,
                                    }}>
                                        {selectedJob?.name}
                                    </div>
                                    <div style={{ color: '#6B7280' }}>
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
                                                fontSize: 11, fontWeight: 600, color: '#6B7280',
                                                textTransform: 'uppercase', letterSpacing: '0.06em',
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
                                                    fontSize: 11, color: '#DC2626', marginTop: 3,
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
                                        cursor: 'pointer', fontSize: 13, color: '#6B7280',
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