import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
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
        } catch (err) {
            const status = (err as AxiosError).response?.status
            if (status === 429) toast.error('Muitas tentativas. Aguarde um instante.')
            else if (status === 400 || status === 401) toast.error('Email ou senha inválidos')
            else toast.error('Não foi possível conectar ao servidor')
            return
        }

        // Credenciais válidas: uma falha aqui é do servidor, não do usuário
        try {
            const u = await userService.getMyProfile()
            setUser(u)
            navigate('/dashboard')
        } catch {
            useAuthStore.getState().logout()
            toast.error('Erro ao carregar seu perfil. Tente novamente.')
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
            {/* Painel: uma página de agenda */}
            <div className="login-brand" style={{
                flex: 1, flexDirection: 'column', justifyContent: 'space-between',
                padding: '40px 56px', background: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
            }}>
                <div className="serif" style={{ fontSize: 28 }}>Agenda</div>

                <div style={{ maxWidth: 440 }}>
                    <h1 className="serif" style={{ fontSize: 'clamp(40px, 4.6vw, 62px)', lineHeight: 1.02, letterSpacing: '-0.025em' }}>
                        Seu dia,<br />em ordem.
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 16, maxWidth: 380, fontSize: 16 }}>
                        Agenda online, fila de espera e pagamento antecipado, tudo no mesmo lugar para você e sua equipe.
                    </p>
                </div>

                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    padding: '14px 16px 6px', maxWidth: 460, position: 'relative',
                }}>
                    {[
                        { t: '09:00', n: 'Corte e barba', d: '45 min', state: 'ok' },
                        { t: '10:00', n: 'Coloração', d: '1 h 30', state: 'wait' },
                        { t: '11:30', n: 'Vaga livre', d: 'fila avisada', state: 'free' },
                    ].map(({ t, n, d, state }) => (
                        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ width: 44, fontSize: 13, color: 'var(--text-muted)' }}>{t}</span>
                            <span style={{
                                flex: 1, padding: '6px 10px', borderRadius: 5, fontSize: 14, fontWeight: 600,
                                background: state === 'ok' ? 'var(--mark-soft)' : 'transparent',
                                border: state === 'wait' ? '1.5px dashed var(--border-strong)' : state === 'free' ? '1px solid transparent' : '1px solid transparent',
                                color: state === 'free' ? 'var(--text-muted)' : 'var(--text)',
                                fontStyle: state === 'free' ? 'italic' : 'normal',
                            }}>
                                {n} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12.5 }}>{d}</span>
                            </span>
                        </div>
                    ))}
                    <div style={{ height: 8 }} />
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
                                    letterSpacing: '0.04em',
                                }}>
                                    Comércio
                                </label>
                                <select
                                    style={selectStyle}
                                    {...registerForm.register('comercioId')}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
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