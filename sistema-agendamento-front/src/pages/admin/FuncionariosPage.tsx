import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { funcionarioService } from '@/services/funcionarioService'
import { Funcionario, FuncionarioRequest } from '@/types/funcionario'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
    nome: z.string().min(2, 'Nome obrigatório'),
    especialidade: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Funcionario | null>(null)

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormData>({ resolver: zodResolver(schema) })

    const load = () => {
        funcionarioService.getTodos()
            .then(setFuncionarios)
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const openCreate = () => {
        setEditing(null)
        reset({ nome: '', especialidade: '', telefone: '', email: '' })
        setShowForm(true)
    }

    const openEdit = (f: Funcionario) => {
        setEditing(f)
        reset({
            nome: f.nome,
            especialidade: f.especialidade ?? '',
            telefone: f.telefone ?? '',
            email: f.email ?? '',
        })
        setShowForm(true)
    }

    const onSubmit = async (data: FormData) => {
        const payload: FuncionarioRequest = {
            nome: data.nome,
            especialidade: data.especialidade || undefined,
            telefone: data.telefone || undefined,
            email: data.email || undefined,
        }
        try {
            if (editing) {
                await funcionarioService.atualizar(editing.id, payload)
                toast.success('Funcionário atualizado')
            } else {
                await funcionarioService.criar(payload)
                toast.success('Funcionário adicionado')
            }
            setShowForm(false)
            load()
        } catch {
            toast.error('Erro ao salvar')
        }
    }

    const handleToggle = async (id: number) => {
        try {
            await funcionarioService.toggleAtivo(id)
            load()
        } catch {
            toast.error('Erro ao atualizar status')
        }
    }

    const inputStyle = {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '9px 12px',
        fontSize: 13, color: 'var(--text)', width: '100%', outline: 'none',
    }

    return (
        <div style={{ maxWidth: 720 }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
            }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {funcionarios.length} {funcionarios.length === 1
                    ? 'profissional' : 'profissionais'}
                </div>
                <button onClick={openCreate} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--text)', color: 'white',
                    fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>
                    <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} />
                    Novo profissional
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
                            {editing ? 'Editar profissional' : 'Novo profissional'}
                        </div>
                        <button onClick={() => setShowForm(false)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: 18,
                        }}>
                            <i className="ti ti-x" aria-hidden="true" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: 12, padding: 20,
                        }}>
                            {[
                                { name: 'nome' as const, label: 'Nome *', span: 2 },
                                { name: 'especialidade' as const, label: 'Especialidade', span: 1 },
                                { name: 'telefone' as const, label: 'Telefone', span: 1 },
                                { name: 'email' as const, label: 'Email', span: 2 },
                            ].map(({ name, label, span }) => (
                                <div key={name} style={{
                                    gridColumn: `span ${span}`,
                                    display: 'flex', flexDirection: 'column', gap: 4,
                                }}>
                                    <label style={{
                                        fontSize: 11, fontWeight: 600,
                                        color: 'var(--text-faint)',
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                    }}>
                                        {label}
                                    </label>
                                    <input {...register(name)} style={inputStyle} />
                                    {errors[name] && (
                                        <span style={{ fontSize: 11, color: 'var(--danger)' }}>
                      {errors[name]?.message}
                    </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{
                            padding: '12px 20px', borderTop: '1px solid var(--border)',
                            display: 'flex', gap: 8, justifyContent: 'flex-end',
                        }}>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{
                                    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
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
                                    padding: '8px 18px', borderRadius: 'var(--radius-sm)',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    background: 'var(--text)', color: 'white', border: 'none',
                                    opacity: isSubmitting ? 0.6 : 1,
                                }}
                            >
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
                                height: 56, background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                            }} />
                        ))}
                    </div>
                ) : funcionarios.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                            Nenhum profissional cadastrado
                        </div>
                        <button onClick={openCreate} style={{
                            padding: '9px 20px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--text)', color: 'white',
                            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                        }}>
                            Adicionar profissional
                        </button>
                    </div>
                ) : (
                    funcionarios.map((f, idx) => (
                        <div key={f.id} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '14px 20px',
                            borderBottom: idx < funcionarios.length - 1
                                ? '1px solid var(--border)' : 'none',
                            opacity: f.ativo ? 1 : 0.5,
                            transition: 'opacity 0.15s',
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--accent-light)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 14,
                                fontWeight: 600, color: 'var(--accent-dark)', flexShrink: 0,
                            }}>
                                {f.nome.charAt(0)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                    {f.nome}
                                    {!f.ativo && (
                                        <span style={{
                                            marginLeft: 8, fontSize: 10, fontWeight: 600,
                                            color: 'var(--text-faint)',
                                            background: 'var(--bg-surface)',
                                            padding: '2px 6px', borderRadius: 4,
                                        }}>
                      INATIVO
                    </span>
                                    )}
                                </div>
                                {f.especialidade && (
                                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                                        {f.especialidade}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button
                                    onClick={() => openEdit(f)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', fontSize: 16, padding: 4,
                                    }}
                                    aria-label="Editar"
                                >
                                    <i className="ti ti-edit" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => handleToggle(f.id)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: f.ativo ? 'var(--danger)' : 'var(--success)',
                                        fontSize: 14, padding: 4, fontWeight: 600,
                                    }}
                                >
                                    {f.ativo ? 'Desativar' : 'Ativar'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Link público */}
            <div style={{
                marginTop: 24, background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '16px 20px',
            }}>
                <div style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6,
                }}>
                    Link público de agendamento
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                    Compartilhe este link com seus clientes para que eles agendem sem precisar criar conta
                </div>
                <div style={{
                    display: 'flex', gap: 8, alignItems: 'center',
                }}>
                    <code style={{
                        flex: 1, background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', padding: '8px 12px',
                        fontSize: 12, color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {window.location.origin}/agendar/{funcionarios[0]?.comercioId}
                    </code>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${window.location.origin}/agendar/${funcionarios[0]?.comercioId}`
                            )
                            toast.success('Link copiado!')
                        }}
                        style={{
                            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface)', color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        <i className="ti ti-copy" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    )
}