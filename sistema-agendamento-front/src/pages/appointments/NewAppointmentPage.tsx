import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { appointmentService } from '@/services/appointmentService'
import { jobService } from '@/services/jobService'
import { funcionarioService } from '@/services/funcionarioService'
import { Job } from '@/types/job'
import { Funcionario } from '@/types/funcionario'

const schema = z.object({
    jobId: z.string().min(1, 'Selecione um serviço'),
    funcionarioId: z.string().optional(),
    date: z.string().min(1, 'Selecione uma data'),
    time: z.string().min(1, 'Selecione um horário'),
})

type FormData = z.infer<typeof schema>

export function NewAppointmentPage() {
    const navigate = useNavigate()
    const [jobs, setJobs] = useState<Job[]>([])
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [times, setTimes] = useState<string[]>([])
    const [loadingTimes, setLoadingTimes] = useState(false)

    const {
        register, handleSubmit, watch, setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { jobId: '', funcionarioId: '', date: '', time: '' },
    })

    const watchedDate = watch('date')
    const watchedJobId = watch('jobId')
    const watchedTime = watch('time')

    useEffect(() => {
        jobService.getAll().then(setJobs)
        funcionarioService.getAtivos().then(setFuncionarios)
    }, [])

    useEffect(() => {
        if (watchedDate && watchedJobId) {
            setLoadingTimes(true)
            setValue('time', '')
            appointmentService
                .getAvailableTimes(watchedDate, Number(watchedJobId))
                .then(setTimes)
                .finally(() => setLoadingTimes(false))
        }
    }, [watchedDate, watchedJobId])

    const onSubmit = async (data: FormData) => {
        try {
            await appointmentService.create({
                jobId: Number(data.jobId),
                date: data.date,
                time: data.time,
                funcionarioId: data.funcionarioId
                    ? Number(data.funcionarioId) : undefined,
            })
            toast.success('Agendamento criado!')
            navigate('/appointments')
        } catch {
            toast.error('Erro ao criar agendamento')
        }
    }

    const selectedJob = jobs.find(j => j.id === Number(watchedJobId))

    const inputStyle = {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '10px 12px',
        fontSize: 14, color: 'var(--text)', width: '100%', outline: 'none',
    }

    return (
        <div style={{ maxWidth: 560 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', overflow: 'hidden',
                }}>
                    {/* Serviço */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
                        }}>
                            1 · Serviço
                        </div>
                        <select {...register('jobId')} style={inputStyle}>
                            <option value="">Selecione um serviço...</option>
                            {jobs.map(j => (
                                <option key={j.id} value={j.id}>
                                    {j.name} — R$ {Number(j.price).toFixed(2)} · {j.durationMinutes}min
                                </option>
                            ))}
                        </select>
                        {errors.jobId && (
                            <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
                                {errors.jobId.message}
                            </div>
                        )}
                        {selectedJob?.description && (
                            <div style={{
                                marginTop: 10, padding: '10px 12px',
                                background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: 13, color: 'var(--text-muted)',
                                borderLeft: '3px solid var(--accent)',
                            }}>
                                {selectedJob.description}
                            </div>
                        )}
                    </div>

                    {/* Profissional (se houver) */}
                    {funcionarios.length > 0 && (
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{
                                fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
                            }}>
                                2 · Profissional (opcional)
                            </div>
                            <select {...register('funcionarioId')} style={inputStyle}>
                                <option value="">Sem preferência</option>
                                {funcionarios.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.nome}{f.especialidade ? ` · ${f.especialidade}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Data */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
                        }}>
                            {funcionarios.length > 0 ? '3' : '2'} · Data
                        </div>
                        <input
                            {...register('date')}
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            style={inputStyle}
                        />
                        {errors.date && (
                            <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
                                {errors.date.message}
                            </div>
                        )}
                    </div>

                    {/* Horário */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
                        }}>
                            {funcionarios.length > 0 ? '4' : '3'} · Horário
                        </div>
                        {loadingTimes ? (
                            <div style={{ height: 36, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }} />
                        ) : times.length === 0 ? (
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
                                {watchedDate && watchedJobId
                                    ? 'Nenhum horário disponível'
                                    : 'Selecione serviço e data'}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {times.map(t => (
                                    <button
                                        key={t} type="button"
                                        onClick={() => setValue('time', t)}
                                        style={{
                                            padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                            background: watchedTime === t ? 'var(--text)' : 'var(--bg-surface)',
                                            color: watchedTime === t ? 'white' : 'var(--text-muted)',
                                            border: `1px solid ${watchedTime === t ? 'var(--text)' : 'var(--border)'}`,
                                        }}
                                    >
                                        {t?.slice(0, 5)}
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.time && (
                            <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6 }}>
                                {errors.time.message}
                            </div>
                        )}
                    </div>

                    {/* Ações */}
                    <div style={{
                        padding: '16px 24px', display: 'flex',
                        gap: 8, justifyContent: 'flex-end',
                    }}>
                        <button
                            type="button"
                            onClick={() => navigate('/appointments')}
                            style={{
                                padding: '9px 18px', borderRadius: 'var(--radius-sm)',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                background: 'var(--bg-surface)', color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                padding: '9px 20px', borderRadius: 'var(--radius-sm)',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                background: 'var(--text)', color: 'white',
                                border: 'none', opacity: isSubmitting ? 0.6 : 1,
                            }}
                        >
                            {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}