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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
            const u = await userService.getMyProfile()
            setUser(u)
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

    const selectStyle: React.CSSProperties = {
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '9px 12px',
        fontSize: 13,
        color: 'var(--text)',
        fontFamily: 'var(--font)',
        outline: 'none',
        transition: 'border-color var(--transition)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: 'var(--bg)', fontFamily: 'var(--font)',
        }}>
            {/* Left panel */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: 48,
                background: 'var(--text)', position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background pattern */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '32px 32px',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        marginBottom: 48,
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'white', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                                      stroke="var(--text)" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <span style={{
                            fontSize: 15, fontWeight: 700, color: 'white',
                            letterSpacing: '-0.02em',
                        }}>
              Sistema Agendamento
            </span>
                    </div>

                    <h1 style={{
                        fontSize: 36, fontWeight: 700, color: 'white',
                        letterSpacing: '-0.04em', lineHeight: 1.15,
                        marginBottom: 16,
                    }}>
                        Organize.<br />Confirme.<br />Cresça.
                    </h1>
                    <p style={{
                        fontSize: 15, color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.6, maxWidth: 320,
                    }}>
                        Gerencie agendamentos, clientes e serviços em um sistema completo e moderno.
                    </p>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {[
                        { num: '100%', label: 'Notificações em tempo real' },
                        { num: 'Multi', label: 'Suporte a vários comércios' },
                        { num: 'Zero', label: 'Configuração técnica necessária' },
                    ].map(({ num, label }) => (
                        <div key={label} style={{
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: '14px 0',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <div style={{
                                fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                                minWidth: 56, letterSpacing: '-0.02em',
                            }}>
                                {num}
                            </div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: 32,
            }}>
                <div style={{
                    width: '100%', maxWidth: 380,
                    animation: 'fadeInScale 0.3s ease both',
                }}>
                    <div style={{ marginBottom: 28 }}>
                        <h2 style={{
                            fontSize: 22, fontWeight: 700, color: 'var(--text)',
                            letterSpacing: '-0.03em', marginBottom: 4,
                        }}>
                            {tab === 'login' ? 'Bem-vindo de volta' : 'Criar uma conta'}
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {tab === 'login'
                                ? 'Entre com seus dados para continuar'
                                : 'Preencha os campos abaixo'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 3, marginBottom: 24,
                    }}>
                        {(['login', 'register'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                style={{
                                    flex: 1, padding: '7px 0',
                                    borderRadius: 6, fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', border: 'none',
                                    background: tab === t ? 'var(--bg-card)' : 'transparent',
                                    color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                                    boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                                    transition: 'all var(--transition)',
                                    fontFamily: 'var(--font)',
                                }}
                            >
                                {t === 'login' ? 'Entrar' : 'Criar conta'}
                            </button>
                        ))}
                    </div>

                    {tab === 'login' ? (
                        <form
                            onSubmit={loginForm.handleSubmit(onLogin)}
                            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                        >
                            <Input
                                label="Email"
                                type="email"
                                placeholder="seu@email.com"
                                error={loginForm.formState.errors.email?.message}
                                {...loginForm.register('email')}
                            />
                            <Input
                                label="Senha"
                                type="password"
                                placeholder="••••••••"
                                error={loginForm.formState.errors.password?.message}
                                {...loginForm.register('password')}
                            />
                            <Button
                                type="submit"
                                loading={loginForm.formState.isSubmitting}
                                size="lg"
                                style={{ marginTop: 4, width: '100%' }}
                            >
                                Entrar
                            </Button>
                        </form>
                    ) : (
                        <form
                            onSubmit={registerForm.handleSubmit(onRegister)}
                            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                        >
                            <Input
                                label="Nome completo"
                                placeholder="Seu nome"
                                error={registerForm.formState.errors.name?.message}
                                {...registerForm.register('name')}
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="seu@email.com"
                                error={registerForm.formState.errors.email?.message}
                                {...registerForm.register('email')}
                            />
                            <Input
                                label="Telefone"
                                placeholder="(11) 99999-9999"
                                error={registerForm.formState.errors.phone?.message}
                                {...registerForm.register('phone')}
                            />
                            <Input
                                label="Senha"
                                type="password"
                                placeholder="••••••••"
                                error={registerForm.formState.errors.password?.message}
                                {...registerForm.register('password')}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <label style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    letterSpacing: '0.04em', textTransform: 'uppercase',
                                }}>
                                    Comércio
                                </label>
                                <select
                                    style={selectStyle}
                                    {...registerForm.register('comercioId')}
                                    onFocus={e => e.target.style.borderColor = 'var(--text)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                >
                                    <option value="">Selecione um comércio</option>
                                    {comercios.map(c => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                                {registerForm.formState.errors.comercioId && (
                                    <span style={{ fontSize: 11, color: 'var(--danger)' }}>
                    {registerForm.formState.errors.comercioId.message}
                  </span>
                                )}
                            </div>
                            <Button
                                type="submit"
                                loading={registerForm.formState.isSubmitting}
                                size="lg"
                                style={{ marginTop: 4, width: '100%' }}
                            >
                                Criar conta
                            </Button>
                        </form>
                    )}

                    <p style={{
                        textAlign: 'center', marginTop: 20,
                        fontSize: 13, color: 'var(--text-muted)',
                    }}>
                        {tab === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                        <button
                            onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--text)', fontWeight: 600, fontSize: 13,
                                fontFamily: 'var(--font)',
                                textDecoration: 'underline', textDecorationColor: 'var(--border)',
                            }}
                        >
                            {tab === 'login' ? 'Criar conta' : 'Entrar'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}