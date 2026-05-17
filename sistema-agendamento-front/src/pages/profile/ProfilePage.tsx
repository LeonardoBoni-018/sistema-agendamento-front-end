import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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

const schema = z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    phone: z.string().min(8, 'Telefone inválido'),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
    const { user, setUser } = useAuthStore()

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
    })

    useEffect(() => {
        if (user) {
            form.reset({ name: user.name, phone: user.phone })
        }
    }, [user])

    const onSubmit = async (data: FormData) => {
        try {
            await userService.updateMyProfile(data)
            const updated = await userService.getMyProfile()
            setUser(updated)
            toast.success('Perfil atualizado!')
        } catch {
            toast.error('Erro ao atualizar perfil!')
        }
    }

    return (
        <div className="max-w-lg space-y-6">
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-white text-lg font-semibold">{user?.name}</p>
                        <p className="text-gray-500 text-sm">{user?.email}</p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Nome</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="bg-white/5 border-white/10 text-white focus:border-cyan-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Telefone</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="bg-white/5 border-white/10 text-white focus:border-cyan-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-1">
                            <p className="text-gray-500 text-sm mb-1">Email</p>
                            <p className="text-gray-400 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                                {user?.email}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">O email não pode ser alterado.</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold mt-2"
                        >
                            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}