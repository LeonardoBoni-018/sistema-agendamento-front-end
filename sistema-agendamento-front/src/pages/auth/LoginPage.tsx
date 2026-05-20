import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { comercioService } from '@/services/comercioService'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'
import { Comercio } from '@/types/comercio'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(8, 'Telefone inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    comercioId: z.string().min(1, 'Selecione um comércio'),
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

function Field({
                   label, error, children,
               }: {
    label: string; error?: string; children: React.ReactNode
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {label.toUpperCase()}
            </label>
            {children}
            {error && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{error}</span>}
        </div>
    )
}

export function LoginPage() {
    const navigate = useNavigate()
    const { setAuth, setUser } = useAuthStore()
    const [tab, setTab] = useState<'login' | 'register'>('login')
    const [comercios, setComercios] = useState<Comercio[]>([])

    useEffect(() => {
        comercioService.getAll().then(setComercios).catch(() => {})
    }, [])

    const loginForm = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    const registerForm = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', phone: '', password: '', comercioId: '' },
    })

    const onLogin = async (data: LoginData) => {
        try {
            const response = await authService.login(data)
            setAuth(response.accessToken, response.refreshToken)
            const user = await userService.getMyProfile()
            setUser(user)
            navigate('/dashboard')
        } catch {
            toast.error('Email ou senha inválidos')
        }
    }

    const onRegister = async (data: RegisterData) => {
        try {
            await authService.register({ ...data, comercioId: Number(data.comercioId) })
            toast.success('Conta criada! Entre para continuar.')
            registerForm.reset()
            setTab('login')
        } catch {
            toast.error('Erro ao criar conta')
        }
    }

    const inputStyle = {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        fontSize: 14,
        color: 'var(--text)',
        width: '100%',
        outline: 'none',
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', background: 'var(--bg)',
        }}>
            {/* Painel esquerdo */}
            <div style={{
                flex: 1, display: 'none', flexDirection: 'column',
                justifyContent: 'space-between', padding: 48,
                background: 'var(--text)', position: 'relative', overflow: 'hidden',
            }} className="login-left">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.08)', borderRadius: 8,
                        padding: '6px 12px', marginBottom: 48,
                    }}>
                        <div style={{
                            width: 20, height: 20, background: 'var(--accent)',
                            borderRadius: 4, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Sistema de Agendamento
            </span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 500, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
                        Organize sua agenda.<br />Cresça seu negócio.
                    </div>
                    <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        Gerencie agendamentos, clientes e serviços em um só lugar.
                    </div>
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {[
                        { num: '2.4k', label: 'Agendamentos gerenciados' },
                        { num: '98%', label: 'Satisfação dos clientes' },
                        { num: '12min', label: 'Economizado por agendamento' },
                    ].map(({ num, label }) => (
                        <div key={label} style={{
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: '14px 0',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--accent)', minWidth: 52 }}>
                                {num}
                            </div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Painel direito */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: 24,
            }}>
                <div style={{ width: '100%', maxWidth: 400 }}>
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                            <div style={{
                                width: 28, height: 28, background: 'var(--accent)',
                                borderRadius: 6, flexShrink: 0,
                            }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                Sistema de Agendamento
              </span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                            {tab === 'login' ? 'Bem-vindo de volta' : 'Criar uma conta'}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                            {tab === 'login'
                                ? 'Entre com seus dados para continuar'
                                : 'Preencha os campos para se cadastrar'}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: 'flex', background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)', padding: 3,
                        marginBottom: 24, border: '1px solid var(--border)',
                    }}>
                        {(['login', 'register'] as const).map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{
                                flex: 1, padding: '7px 0', borderRadius: 5,
                                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                background: tab === t ? 'var(--bg-card)' : 'transparent',
                                color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                                border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
                                transition: 'all 0.15s',
                            }}>
                                {t === 'login' ? 'Entrar' : 'Criar conta'}
                            </button>
                        ))}
                    </div>

                    {tab === 'login' ? (
                        <form onSubmit={loginForm.handleSubmit(onLogin)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Email" error={loginForm.formState.errors.email?.message}>
                                <input {...loginForm.register('email')} placeholder="seu@email.com" style={inputStyle} />
                            </Field>
                            <Field label="Senha" error={loginForm.formState.errors.password?.message}>
                                <input {...loginForm.register('password')} type="password" placeholder="••••••••" style={inputStyle} />
                            </Field>
                            <button type="submit" disabled={loginForm.formState.isSubmitting} style={{
                                padding: '11px', borderRadius: 'var(--radius-sm)',
                                background: 'var(--text)', color: 'white',
                                fontSize: 14, fontWeight: 600, border: 'none',
                                cursor: 'pointer', marginTop: 4, transition: 'opacity 0.15s',
                                opacity: loginForm.formState.isSubmitting ? 0.6 : 1,
                            }}>
                                {loginForm.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={registerForm.handleSubmit(onRegister)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <Field label="Nome completo" error={registerForm.formState.errors.name?.message}>
                                <input {...registerForm.register('name')} placeholder="Seu nome" style={inputStyle} />
                            </Field>
                            <Field label="Email" error={registerForm.formState.errors.email?.message}>
                                <input {...registerForm.register('email')} placeholder="seu@email.com" style={inputStyle} />
                            </Field>
                            <Field label="Telefone" error={registerForm.formState.errors.phone?.message}>
                                <input {...registerForm.register('phone')} placeholder="(11) 99999-9999" style={inputStyle} />
                            </Field>
                            <Field label="Senha" error={registerForm.formState.errors.password?.message}>
                                <input {...registerForm.register('password')} type="password" placeholder="••••••••" style={inputStyle} />
                            </Field>
                            <Field label="Comércio" error={registerForm.formState.errors.comercioId?.message}>
                                <select {...registerForm.register('comercioId')} style={inputStyle}>
                                    <option value="">Selecione um comércio</option>
                                    {comercios.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                            </Field>
                            <button type="submit" disabled={registerForm.formState.isSubmitting} style={{
                                padding: '11px', borderRadius: 'var(--radius-sm)',
                                background: 'var(--text)', color: 'white',
                                fontSize: 14, fontWeight: 600, border: 'none',
                                cursor: 'pointer', marginTop: 4,
                                opacity: registerForm.formState.isSubmitting ? 0.6 : 1,
                            }}>
                                {registerForm.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
                            </button>
                        </form>
                    )}

                    <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                        {tab === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                        <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--accent-dark)', fontWeight: 600, fontSize: 13,
                        }}>
                            {tab === 'login' ? 'Criar conta' : 'Entrar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}