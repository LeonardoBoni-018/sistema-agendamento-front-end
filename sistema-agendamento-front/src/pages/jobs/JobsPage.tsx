import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { jobService } from '@/services/jobService'
import { Job } from '@/types/job'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { sseService } from '@/services/sseService'

const schema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    description: z.string().min(1, 'Descrição obrigatória'),
    price: z.string().min(1, 'Preço obrigatório'),
    durationMinutes: z.string().min(1, 'Duração obrigatória'),
})

type FormData = z.infer<typeof schema>

export function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Job | null>(null)

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const load = () => {
        jobService.getAll().then(setJobs).finally(() => setLoading(false))
    }

    useEffect(() => {
        load()

        const unsubCreate = sseService.on('JOB_CREATED', (payload) => {
            load()
            toast.success(payload.data.message ?? 'Novo serviço criado', {
                description: payload.data.job?.name,
                duration: 4000,
            })
        })

        const unsubUpdate = sseService.on('JOB_UPDATED', (payload) => {
            load()
            toast.info(payload.data.message ?? 'Serviço atualizado', {
                description: payload.data.job?.name,
                duration: 4000,
            })
        })

        const unsubDelete = sseService.on('JOB_DELETED', (payload) => {
            load()
            toast.warning(payload.data.message ?? 'Serviço removido', {
                duration: 4000,
            })
        })

        return () => {
            unsubCreate()
            unsubUpdate()
            unsubDelete()
        }
    }, [])

    const openCreate = () => {
        setEditing(null)
        reset({ name: '', description: '', price: '', durationMinutes: '' })
        setShowForm(true)
    }

    const openEdit = (job: Job) => {
        setEditing(job)
        reset({
            name: job.name,
            description: job.description,
            price: String(job.price),
            durationMinutes: String(job.durationMinutes),
        })
        setShowForm(true)
    }

    const onSubmit = async (data: FormData) => {
        try {
            const payload = {
                name: data.name, description: data.description,
                price: Number(data.price), durationMinutes: Number(data.durationMinutes),
            }
            if (editing) {
                await jobService.update(editing.id, payload)
                toast.success('Serviço atualizado')
            } else {
                await jobService.create(payload)
                toast.success('Serviço criado')
            }
            setShowForm(false)
            load()
        } catch {
            toast.error('Erro ao salvar serviço')
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await jobService.delete(id)
            toast.success('Serviço removido')
            load()
        } catch {
            toast.error('Não é possível remover — existem agendamentos ativos')
        }
    }

    const inputStyle = {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '9px 12px',
        fontSize: 13, color: 'var(--text)', width: '100%', outline: 'none',
    }

    return (
        <div style={{ maxWidth: 900 }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 20,
            }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {jobs.length} {jobs.length === 1 ? 'serviço cadastrado' : 'serviços cadastrados'}
                </div>
                <button onClick={openCreate} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--text)', color: 'white',
                    fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>
                    <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} />
                    Novo serviço
                </button>
            </div>

            {showForm && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', marginBottom: 16, overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '14px 20px', borderBottom: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                            {editing ? 'Editar serviço' : 'Novo serviço'}
                        </div>
                        <button onClick={() => setShowForm(false)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: 16,
                        }}>
                            <i className="ti ti-x" aria-hidden="true" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: 12, padding: '20px',
                        }}>
                            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nome</label>
                                <input {...register('name')} placeholder="Ex: Corte masculino" style={inputStyle} />
                                {errors.name && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.name.message}</span>}
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descrição</label>
                                <input {...register('description')} placeholder="Descreva o serviço" style={inputStyle} />
                                {errors.description && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.description.message}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preço (R$)</label>
                                <input {...register('price')} type="number" step="0.01" placeholder="0,00" style={inputStyle} />
                                {errors.price && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.price.message}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duração (min)</label>
                                <input {...register('durationMinutes')} type="number" placeholder="30" style={inputStyle} />
                                {errors.durationMinutes && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.durationMinutes.message}</span>}
                            </div>
                        </div>
                        <div style={{
                            padding: '12px 20px', borderTop: '1px solid var(--border)',
                            display: 'flex', gap: 8, justifyContent: 'flex-end',
                        }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{
                                padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                background: 'var(--bg-surface)', color: 'var(--text-muted)',
                                border: '1px solid var(--border)',
                            }}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSubmitting} style={{
                                padding: '8px 18px', borderRadius: 'var(--radius-sm)',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                background: 'var(--text)', color: 'white',
                                border: 'none', opacity: isSubmitting ? 0.6 : 1,
                            }}>
                                {isSubmitting ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
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
                                height: 64, background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                            }} />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>✂️</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                            Nenhum serviço cadastrado
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                            Adicione os serviços que seu comércio oferece
                        </div>
                        <button onClick={openCreate} style={{
                            padding: '9px 20px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--text)', color: 'white',
                            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                        }}>
                            Criar primeiro serviço
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '2fr 3fr 90px 80px 80px',
                            padding: '10px 20px', borderBottom: '1px solid var(--border)',
                            fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                            <span>Nome</span>
                            <span>Descrição</span>
                            <span>Valor</span>
                            <span>Duração</span>
                            <span></span>
                        </div>
                        {jobs.map((job, idx) => (
                            <div key={job.id} style={{
                                display: 'grid', gridTemplateColumns: '2fr 3fr 90px 80px 80px',
                                padding: '14px 20px', alignItems: 'center',
                                borderBottom: idx < jobs.length - 1 ? '1px solid var(--border)' : 'none',
                                transition: 'background 0.1s',
                            }}
                                 onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                                 onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                    {job.name}
                                </div>
                                <div style={{
                                    fontSize: 13, color: 'var(--text-muted)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {job.description}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                    R$ {Number(job.price).toFixed(2)}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    {job.durationMinutes}min
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={() => openEdit(job)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', fontSize: 15, padding: 2,
                                    }}>
                                        <i className="ti ti-edit" aria-hidden="true" />
                                    </button>
                                    <button onClick={() => handleDelete(job.id)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--danger)', fontSize: 15, padding: 2,
                                    }}>
                                        <i className="ti ti-trash" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}