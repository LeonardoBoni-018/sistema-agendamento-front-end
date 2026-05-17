import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { userService } from '@/services/userService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import type { ControllerRenderProps } from 'react-hook-form'

const schema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
    const navigate = useNavigate()
    const { setAuth, setUser } = useAuthStore()

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = async (data: FormData) => {
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

    return (
        <div className="min-h-screen bg-[#13151a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-3 justify-center mb-8">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center font-bold text-black">
                        S.
                    </div>
                    <span className="text-white text-xl font-semibold">Sistema Agendamento</span>
                </div>

                <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8">
                    <h2 className="text-white text-2xl font-semibold mb-1">Bem-vindo de volta</h2>
                    <p className="text-gray-400 text-sm mb-6">Entre com suas credenciais para continuar</p>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }: { field: ControllerRenderProps<FormData, 'email'> }) => (
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
                                control={form.control}
                                name="password"
                                render={({ field }: { field: ControllerRenderProps<FormData, 'password'> }) => (
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
                                disabled={form.formState.isSubmitting}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold mt-2"
                            >
                                {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}