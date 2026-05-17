import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { appointmentService } from '@/services/appointmentService'
import { jobService } from '@/services/jobService'
import { Job } from '@/types/job'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const schema = z.object({
    jobId: z.string().min(1, 'Selecione um serviço'),
    date: z.string().min(1, 'Selecione uma data'),
    time: z.string().min(1, 'Selecione um horário'),
})

type FormData = z.infer<typeof schema>

export function NewAppointmentPage() {
    const navigate = useNavigate()
    const [jobs, setJobs] = useState<Job[]>([])
    const [availableTimes, setAvailableTimes] = useState<string[]>([])
    const [loadingTimes, setLoadingTimes] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { jobId: '', date: '', time: '' },
    })

    const watchedDate = form.watch('date')
    const watchedJobId = form.watch('jobId')

    useEffect(() => {
        jobService.getAll().then(setJobs)
    }, [])

    useEffect(() => {
        if (watchedDate && watchedJobId) {
            setLoadingTimes(true)
            form.setValue('time', '')
            appointmentService
                .getAvailableTimes(watchedDate, Number(watchedJobId))
                .then(setAvailableTimes)
                .finally(() => setLoadingTimes(false))
        }
    }, [watchedDate, watchedJobId])

    const onSubmit = async (data: FormData) => {
        try {
            await appointmentService.create({
                jobId: Number(data.jobId),
                date: data.date,
                time: data.time,
            })
            toast.success('Agendamento criado com sucesso!')
            navigate('/appointments')
        } catch {
            toast.error('Erro ao criar agendamento!')
        }
    }

    const selectedJob = jobs.find(j => j.id === Number(watchedJobId))

    return (
        <div className="max-w-xl">
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="jobId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Serviço</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                        >
                                            <option value="" className="bg-[#0f1117]">Selecione um serviço</option>
                                            {jobs.map(job => (
                                                <option key={job.id} value={job.id} className="bg-[#0f1117]">
                                                    {job.name} — R$ {Number(job.price).toFixed(2)} ({job.durationMinutes}min)
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedJob && (
                            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-sm text-gray-400">
                                {selectedJob.description}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Data</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            className="bg-white/5 border-white/10 text-white focus:border-cyan-500"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Horário disponível</FormLabel>
                                    <FormControl>
                                        {loadingTimes ? (
                                            <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
                                        ) : availableTimes.length === 0 ? (
                                            <p className="text-gray-500 text-sm py-2">
                                                {watchedDate && watchedJobId
                                                    ? 'Nenhum horário disponível nesta data.'
                                                    : 'Selecione um serviço e uma data.'}
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-2">
                                                {availableTimes.map(time => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={() => form.setValue('time', time)}
                                                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            field.value === time
                                                                ? 'bg-cyan-500 text-black'
                                                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                                        }`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/appointments')}
                                className="flex-1 border-white/10 text-gray-400 hover:text-white bg-transparent"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                            >
                                {form.formState.isSubmitting ? 'Criando...' : 'Confirmar Agendamento'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}