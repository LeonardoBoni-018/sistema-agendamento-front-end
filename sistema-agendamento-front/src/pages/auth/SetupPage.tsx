import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/services/api'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
    comercioNome: z.string().min(2, 'Informe o nome do negócio'),
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type SetupData = z.infer<typeof schema>

export function SetupPage() {
    const navigate = useNavigate()
    const { setAuth, setUser } = useAuthStore()
    const form = useForm<SetupData>({
        resolver: zodResolver(schema),
        defaultValues: { comercioNome: '', name: '', email: '', phone: '', password: '' },
    })

    const onSubmit = async (d: SetupData) => {
        try {
            const res = await api.post('/v1/auth/setup', {
                name: d.name,
                email: d.email,
                phone: d.phone,
                password: d.password,
                comercio: { nome: d.comercioNome },
            })
            setAuth(res.data.accessToken, res.data.refreshToken)
            setUser(await userService.getMyProfile())
            toast.success('Tudo pronto! Bem-vindo.')
            navigate('/dashboard')
        } catch (e: unknown) {
            const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(msg ?? 'Não foi possível concluir o cadastro inicial')
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 400, animation: 'fadeInScale 0.3s ease both' }}>
                <div className="serif" style={{ fontSize: 28, marginBottom: 28 }}>Agenda</div>
                <h1 className="serif" style={{ fontSize: 34, marginBottom: 6 }}>
                    Configuração inicial
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    Cadastre seu negócio e a conta de administrador. Disponível apenas uma vez.
                </p>
                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Input label="Nome do negócio" placeholder="Studio Exemplo"
                           error={form.formState.errors.comercioNome?.message} {...form.register('comercioNome')} />
                    <Input label="Seu nome" placeholder="Nome completo"
                           error={form.formState.errors.name?.message} {...form.register('name')} />
                    <Input label="Email" type="email" placeholder="voce@email.com"
                           error={form.formState.errors.email?.message} {...form.register('email')} />
                    <Input label="Telefone" placeholder="(11) 99999-9999"
                           error={form.formState.errors.phone?.message} {...form.register('phone')} />
                    <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres"
                           error={form.formState.errors.password?.message} {...form.register('password')} />
                    <Button type="submit" size="lg" loading={form.formState.isSubmitting}
                            style={{ marginTop: 6, width: '100%' }}>
                        Criar conta de administrador
                    </Button>
                </form>
            </div>
        </div>
    )
}
