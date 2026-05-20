import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'

const schema = z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    phone: z.string().min(8, 'Telefone inválido'),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
    const { user, setUser } = useAuthStore()

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
    })

    useEffect(() => {
        if (user) reset({ name: user.name, phone: user.phone ?? '' })
    }, [user])

    const onSubmit = async (data: FormData) => {
        try {
            await userService.updateMyProfile(data)
            const updated = await userService.getMyProfile()
            setUser(updated)
            toast.success('Perfil atualizado')
        } catch {
            toast.error('Erro ao atualizar perfil')
        }
    }

    const inputStyle = {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '10px 12px',
        fontSize: 14, color: 'var(--text)', width: '100%', outline: 'none',
    }

    return (
        <div style={{ maxWidth: 480 }}>
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: 'var(--accent-light)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 600, color: 'var(--accent-dark)',
                        flexShrink: 0,
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                            {user?.comercioNome}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Nome
                            </label>
                            <input {...register('name')} style={inputStyle} />
                            {errors.name && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.name.message}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Telefone
                            </label>
                            <input {...register('phone')} style={inputStyle} />
                            {errors.phone && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.phone.message}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Email
                            </label>
                            <div style={{
                                ...inputStyle, background: 'var(--bg-surface)',
                                color: 'var(--text-muted)', cursor: 'not-allowed',
                            }}>
                                {user?.email}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                O email não pode ser alterado
              </span>
                        </div>
                    </div>

                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                        <button type="submit" disabled={isSubmitting} style={{
                            width: '100%', padding: '10px',
                            borderRadius: 'var(--radius-sm)', background: 'var(--text)',
                            color: 'white', fontSize: 14, fontWeight: 600,
                            border: 'none', cursor: 'pointer',
                            opacity: isSubmitting ? 0.6 : 1,
                        }}>
                            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}