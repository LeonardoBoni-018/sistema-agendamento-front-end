import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { jobService } from '@/services/jobService'
import { Job } from '@/types/job'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    description: z.string().min(1, 'Descrição obrigatória'),
    price: z.string().min(1, 'Preço obrigatório'),
    durationMinutes: z.string().min(1, 'Duração obrigatória'),
})

type FormData = z.infer<typeof schema>

export function JobsPage() {
    const { isAdmin } = useAuthStore()
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingJob, setEditingJob] = useState<Job | null>(null)

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', description: '', price: '', durationMinutes: '' },
    })

    const load = () => {
        jobService.getAll()
            .then(setJobs)
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const openCreate = () => {
        setEditingJob(null)
        form.reset({ name: '', description: '', price: '', durationMinutes: '' })
        setDialogOpen(true)
    }

    const openEdit = (job: Job) => {
        setEditingJob(job)
        form.reset({
            name: job.name,
            description: job.description,
            price: String(job.price),
            durationMinutes: String(job.durationMinutes),
        })
        setDialogOpen(true)
    }

    const onSubmit = async (data: FormData) => {
        try {
            const payload = {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                durationMinutes: Number(data.durationMinutes),
            }
            if (editingJob) {
                await jobService.update(editingJob.id, payload)
                toast.success('Serviço atualizado!')
            } else {
                await jobService.create(payload)
                toast.success('Serviço criado!')
            }
            setDialogOpen(false)
            load()
        } catch {
            toast.error('Erro ao salvar serviço!')
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await jobService.delete(id)
            toast.success('Serviço excluído!')
            load()
        } catch {
            toast.error('Não é possível excluir um serviço com agendamentos ativos!')
        }
    }

    return (
        <div className="space-y-6">
            {isAdmin() && (
                <div className="flex justify-end">
                    <Button
                        onClick={openCreate}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                    >
                        <Plus size={16} className="mr-2" />
                        Novo Serviço
                    </Button>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-36 bg-[#0f1117] rounded-xl animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map(job => (
                        <div
                            key={job.id}
                            className="bg-[#0f1117] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-white font-semibold">{job.name}</h3>
                                {isAdmin() && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(job)}
                                            className="text-gray-500 hover:text-cyan-400 transition-colors"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>
                            <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-semibold">
                  R$ {Number(job.price).toFixed(2)}
                </span>
                                <span className="text-gray-500 text-xs">
                  {job.durationMinutes} min
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-[#0f1117] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingJob ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {(['name', 'description', 'price', 'durationMinutes'] as const).map((fieldName) => (
                                <FormField
                                    key={fieldName}
                                    control={form.control}
                                    name={fieldName}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">
                                                {fieldName === 'name' ? 'Nome'
                                                    : fieldName === 'description' ? 'Descrição'
                                                        : fieldName === 'price' ? 'Preço (R$)'
                                                            : 'Duração (minutos)'}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type={fieldName === 'price' || fieldName === 'durationMinutes' ? 'number' : 'text'}
                                                    className="bg-white/5 border-white/10 text-white focus:border-cyan-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    className="flex-1 border-white/10 text-gray-400 bg-transparent"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                                >
                                    {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}