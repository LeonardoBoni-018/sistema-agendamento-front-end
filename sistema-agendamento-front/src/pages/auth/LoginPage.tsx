import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'
import { Button } from 'src/components/ui/button'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().transform((val) => val?.replace(/\D/g, '') || '').pipe(z.string().min(10, 'Telefone deve ter 10 ou 11 dígitos').max(11, 'Telefone deve ter 10 ou 11 dígitos')),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

export function LoginPage() {
    const navigate = useNavigate()
    const { setAuth, setUser } = useAuthStore()
    const [tab, setTab] = useState<'login' | 'register'>('login')

    const loginForm = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    const registerForm = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', phone: '', password: '' },
    })

    const onLogin = async (data: LoginData) => {
        try {
            const response = await authService.login(data)
            setAuth(response.accessToken, response.refreshToken)
            const user = await userService.getMyProfile()
            setUser(user)
            toast.success('Login realizado com sucesso!')
            navigate('/dashboard')
        } catch {
            toast.error('Email ou senha inválidos!')
        }
    }

    const onRegister = async (data: RegisterData) => {
        try {
            await authService.register(data)
            toast.success('Conta criada! Faça login para continuar.')
            registerForm.reset()
            setTab('login')
        } catch {
            toast.error('Erro ao criar conta. Email já cadastrado?')
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#0f1117] flex">
            {/* Lado esquerdo — visual */}
            <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center font-bold text-black text-sm">
                            S.
                        </div>
                        <span className="text-white font-semibold">Sistema Agendamento</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="space-y-8">
                        {[
                            { icon: '📅', text: 'Agende serviços com facilidade' },
                            { icon: '✅', text: 'Acompanhe seus agendamentos em tempo real' },
                            { icon: '🔔', text: 'Receba confirmações instantâneas' },
                        ].map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl">
                                    {icon}
                                </div>
                                <p className="text-gray-300 text-base">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-gray-500 text-sm">© 2025 Sistema Agendamento</p>
            </div>

            {/* Lado direito — formulário */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo mobile */}
                    <div className="flex items-center gap-3 justify-center mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center font-bold text-black text-sm">
                            S.
                        </div>
                        <span className="text-white font-semibold text-lg">Sistema Agendamento</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1.5">
                        <button
                            onClick={() => setTab('login')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                tab === 'login'
                                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setTab('register')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                tab === 'register'
                                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Criar usuário
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                        {tab === 'login' ? (
                            <>
                                <h2 className="text-white text-2xl font-semibold mb-1">
                                    Bem-vindo de volta
                                </h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    Entre com suas credenciais para continuar
                                </p>

                                <form
                                    onSubmit={loginForm.handleSubmit(onLogin)}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-gray-300 text-sm">Email</label>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
                                            {...loginForm.register('email')}
                                        />
                                        {loginForm.formState.errors.email && (
                                            <p className="text-red-500 text-xs">{loginForm.formState.errors.email.message as string}</p>
                                        )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-gray-300 text-sm">Senha</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
                                                {...loginForm.register('password')}
                                            />
                                            {loginForm.formState.errors.password && (
                                                <p className="text-red-500 text-xs">{loginForm.formState.errors.password.message as string}</p>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loginForm.formState.isSubmitting}
                                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold mt-2"
                                        >
                                            {loginForm.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
                                        </Button>
                                    </form>

                                <p className="text-center text-gray-500 text-xs mt-4">
                                    Não tem uma conta?{' '}
                                    <button
                                        onClick={() => setTab('register')}
                                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        Criar usuário
                                    </button>
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-white text-2xl font-semibold mb-1">
                                    Criar usuário
                                </h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    Preencha os dados para se cadastrar
                                </p>

                                <form
                                    onSubmit={registerForm.handleSubmit(onRegister)}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-gray-300 text-sm">Nome</label>
                                        <input
                                            type="text"
                                            placeholder="Seu nome completo"
                                            className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
                                            {...registerForm.register('name')}
                                        />
                                        {registerForm.formState.errors.name && (
                                            <p className="text-red-500 text-xs">{registerForm.formState.errors.name.message as string}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-300 text-sm">Email</label>
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
                                            {...registerForm.register('email')}
                                        />
                                        {registerForm.formState.errors.email && (
                                            <p className="text-red-500 text-xs">{registerForm.formState.errors.email.message as string}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-300 text-sm">Telefone</label>
                                        <input
                                            type="text"
                                            placeholder="(11) 99999-9999"
                                            className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
                                            {...registerForm.register('phone')}
                                        />
                                        {registerForm.formState.errors.phone && (
                                            <p className="text-red-500 text-xs">{registerForm.formState.errors.phone.message as string}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-300 text-sm">Senha</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full h-10 px-3 rounded-md border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
                                            {...registerForm.register('password')}
                                        />
                                        {registerForm.formState.errors.password && (
                                            <p className="text-red-500 text-xs">{registerForm.formState.errors.password.message as string}</p>
                                        )}
                                    </div>
                                        <Button
                                            type="submit"
                                            disabled={registerForm.formState.isSubmitting}
                                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold mt-2"
                                        >
                                            {registerForm.formState.isSubmitting
                                                ? 'Criando...'
                                                : 'Criar usuário'}
                                        </Button>
                                    </form>

                                <p className="text-center text-gray-500 text-xs mt-4">
                                    Já tem uma conta?{' '}
                                    <button
                                        onClick={() => setTab('login')}
                                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                    >
                                        Entrar
                                    </button>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}