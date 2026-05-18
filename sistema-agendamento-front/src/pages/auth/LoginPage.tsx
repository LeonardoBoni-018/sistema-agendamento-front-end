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
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from 'src/components/ui/form'

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
            await authService.register({
                ...data,
                comercioId: Number(data.comercioId),
            })
            toast.success('Conta criada! Faça login para continuar.')
            registerForm.reset()
            setTab('login')
        } catch {
            toast.error('Erro ao criar conta. Email já cadastrado?')
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#13151a] flex">
            {/* Lado esquerdo */}
            <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-[#0f1117] border-r border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center font-bold text-black text-sm">
                        S.
                    </div>
                    <span className="text-white font-semibold">Sistema Agendamento</span>
                </div>

                <div>
                    <div className="space-y-6 mb-12">
                        {[
                            { icon: '📅', text: 'Agende serviços com facilidade' },
                            { icon: '✅', text: 'Acompanhe seus agendamentos em tempo real' },
                            { icon: '🔔', text: 'Receba confirmações instantâneas' },
                        ].map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-lg">
                                    {icon}
                                </div>
                                <p className="text-gray-300 text-sm">{text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm italic mb-4">
                            "Sistema muito prático, facilitou muito o gerenciamento dos nossos agendamentos!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                                A
                            </div>
                            <div>
                                <p className="text-white text-xs font-medium">Admin</p>
                                <p className="text-gray-500 text-xs">Gestor do sistema</p>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-gray-600 text-xs">© 2025 Sistema Agendamento</p>
            </div>

            {/* Lado direito */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-3 justify-center mb-8 lg:hidden">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center font-bold text-black text-sm">
                            S.
                        </div>
                        <span className="text-white font-semibold">Sistema Agendamento</span>
                    </div>

                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
                        <button
                            onClick={() => setTab('login')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                tab === 'login'
                                    ? 'bg-cyan-500 text-black'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setTab('register')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                tab === 'register'
                                    ? 'bg-cyan-500 text-black'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Criar conta
                        </button>
                    </div>

                    <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8">
                        {tab === 'login' ? (
                            <>
                                <h2 className="text-white text-2xl font-semibold mb-1">
                                    Bem-vindo de volta
                                </h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    Entre com suas credenciais para continuar
                                </p>
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                        <FormField
                                            control={loginForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="seu@email.com"
                                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Senha</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="password"
                                                            placeholder="••••••••"
                                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={loginForm.formState.isSubmitting}
                                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold mt-2"
                                        >
                                            {loginForm.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
                                        </Button>
                                    </form>
                                </Form>
                                <p className="text-center text-gray-500 text-xs mt-4">
                                    Não tem uma conta?{' '}
                                    <button onClick={() => setTab('register')} className="text-cyan-400 hover:text-cyan-300">
                                        Criar conta
                                    </button>
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-white text-2xl font-semibold mb-1">Criar conta</h2>
                                <p className="text-gray-400 text-sm mb-6">Preencha os dados para se cadastrar</p>
                                <Form {...registerForm}>
                                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                        <FormField
                                            control={registerForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Nome</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Seu nome completo"
                                                               className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="seu@email.com"
                                                               className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Telefone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="(11) 99999-9999"
                                                               className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Senha</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="password" placeholder="••••••••"
                                                               className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* ✅ Select de comércio */}
                                        <FormField
                                            control={registerForm.control}
                                            name="comercioId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-300">Comércio</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                                        >
                                                            <option value="" className="bg-[#0f1117]">
                                                                Selecione um comércio
                                                            </option>
                                                            {comercios.map((c) => (
                                                                <option key={c.id} value={c.id} className="bg-[#0f1117]">
                                                                    {c.nome}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            disabled={registerForm.formState.isSubmitting}
                                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold mt-2"
                                        >
                                            {registerForm.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
                                        </Button>
                                    </form>
                                </Form>
                                <p className="text-center text-gray-500 text-xs mt-4">
                                    Já tem uma conta?{' '}
                                    <button onClick={() => setTab('login')} className="text-cyan-400 hover:text-cyan-300">
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