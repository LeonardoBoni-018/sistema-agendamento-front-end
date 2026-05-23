import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { horarioService } from '@/services/horarioService'
import {
    HorarioFuncionamento,
    BloqueioHorario,
    DIAS_SEMANA,
    DIA_LABELS,
    DiaSemana,
} from '@/types/horario'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ConfiguracaoPage() {
    const [horarios, setHorarios] = useState<HorarioFuncionamento[]>([])
    const [bloqueios, setBloqueios] = useState<BloqueioHorario[]>([])
    const [loadingHorarios, setLoadingHorarios] = useState(true)
    const [loadingBloqueios, setLoadingBloqueios] = useState(true)
    const [savingDia, setSavingDia] = useState<DiaSemana | null>(null)

    const [showBloqueioForm, setShowBloqueioForm] = useState(false)
    const [bloqueioForm, setBloqueioForm] = useState({
        dataInicio: '',
        dataFim: '',
        horaInicio: '',
        horaFim: '',
        motivo: '',
        diaInteiro: true,
    })

    useEffect(() => {
        horarioService.getHorarios()
            .then(setHorarios)
            .finally(() => setLoadingHorarios(false))

        horarioService.getBloqueios()
            .then(setBloqueios)
            .finally(() => setLoadingBloqueios(false))
    }, [])

    const getHorario = (dia: DiaSemana): HorarioFuncionamento | undefined =>
        horarios.find(h => h.diaSemana === dia)

    const handleToggleDia = async (dia: DiaSemana, aberto: boolean) => {
        const atual = getHorario(dia)
        setSavingDia(dia)
        try {
            const saved = await horarioService.salvarHorario({
                diaSemana: dia,
                aberto,
                abertura: atual?.abertura ?? '08:00',
                fechamento: atual?.fechamento ?? '18:00',
            })
            setHorarios(prev => {
                const idx = prev.findIndex(h => h.diaSemana === dia)
                if (idx >= 0) {
                    const updated = [...prev]
                    updated[idx] = saved
                    return updated
                }
                return [...prev, saved]
            })
            toast.success(`${DIA_LABELS[dia]} ${aberto ? 'ativado' : 'desativado'}`)
        } catch {
            toast.error('Erro ao salvar horário')
        } finally {
            setSavingDia(null)
        }
    }

    const handleSaveHorario = async (
        dia: DiaSemana,
        abertura: string,
        fechamento: string
    ) => {
        setSavingDia(dia)
        try {
            const saved = await horarioService.salvarHorario({
                diaSemana: dia,
                aberto: true,
                abertura,
                fechamento,
            })
            setHorarios(prev => {
                const idx = prev.findIndex(h => h.diaSemana === dia)
                if (idx >= 0) {
                    const updated = [...prev]
                    updated[idx] = saved
                    return updated
                }
                return [...prev, saved]
            })
            toast.success('Horário salvo')
        } catch {
            toast.error('Erro ao salvar horário')
        } finally {
            setSavingDia(null)
        }
    }

    const handleCriarBloqueio = async () => {
        try {
            const saved = await horarioService.criarBloqueio({
                dataInicio: bloqueioForm.dataInicio,
                dataFim: bloqueioForm.dataFim,
                horaInicio: bloqueioForm.diaInteiro ? undefined : bloqueioForm.horaInicio,
                horaFim: bloqueioForm.diaInteiro ? undefined : bloqueioForm.horaFim,
                motivo: bloqueioForm.motivo || undefined,
                diaInteiro: bloqueioForm.diaInteiro,
            })
            setBloqueios(prev => [...prev, saved])
            setShowBloqueioForm(false)
            setBloqueioForm({
                dataInicio: '', dataFim: '', horaInicio: '',
                horaFim: '', motivo: '', diaInteiro: true,
            })
            toast.success('Bloqueio criado')
        } catch {
            toast.error('Erro ao criar bloqueio')
        }
    }

    const handleDeletarBloqueio = async (id: number) => {
        try {
            await horarioService.deletarBloqueio(id)
            setBloqueios(prev => prev.filter(b => b.id !== id))
            toast.success('Bloqueio removido')
        } catch {
            toast.error('Erro ao remover bloqueio')
        }
    }

    const inputStyle = {
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '7px 10px',
        fontSize: 13, color: 'var(--text)', outline: 'none',
    }

    return (
        <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Horários de funcionamento */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
                <div style={{
                    padding: '16px 20px', borderBottom: '1px solid var(--border)',
                }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                        Horários de funcionamento
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                        Configure os dias e horários em que o comércio atende
                    </div>
                </div>

                {loadingHorarios ? (
                    <div style={{ padding: 20 }}>
                        {[...Array(7)].map((_, i) => (
                            <div key={i} style={{
                                height: 48, background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                            }} />
                        ))}
                    </div>
                ) : (
                    <div>
                        {DIAS_SEMANA.map((dia, idx) => {
                            const horario = getHorario(dia)
                            const aberto = horario?.aberto ?? false
                            const saving = savingDia === dia

                            return (
                                <div key={dia} style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '14px 20px',
                                    borderBottom: idx < DIAS_SEMANA.length - 1
                                        ? '1px solid var(--border)' : 'none',
                                    opacity: saving ? 0.6 : 1,
                                    transition: 'opacity 0.15s',
                                }}>
                                    {/* Toggle */}
                                    <button
                                        onClick={() => handleToggleDia(dia, !aberto)}
                                        disabled={saving}
                                        style={{
                                            width: 36, height: 20, borderRadius: 10,
                                            background: aberto ? 'var(--success)' : 'var(--border)',
                                            border: 'none', cursor: 'pointer',
                                            position: 'relative', flexShrink: 0,
                                            transition: 'background 0.2s',
                                        }}
                                        aria-label={`${aberto ? 'Fechar' : 'Abrir'} ${DIA_LABELS[dia]}`}
                                    >
                                        <div style={{
                                            width: 14, height: 14, borderRadius: '50%',
                                            background: 'white', position: 'absolute',
                                            top: 3, left: aberto ? 19 : 3,
                                            transition: 'left 0.2s',
                                        }} />
                                    </button>

                                    <div style={{
                                        fontSize: 13, fontWeight: 600, color: 'var(--text)',
                                        minWidth: 130,
                                    }}>
                                        {DIA_LABELS[dia]}
                                    </div>

                                    {aberto ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                                            <input
                                                type="time"
                                                defaultValue={horario?.abertura ?? '08:00'}
                                                style={{ ...inputStyle, width: 110 }}
                                                onBlur={e => handleSaveHorario(
                                                    dia,
                                                    e.target.value,
                                                    (document.querySelector(
                                                        `[data-fechamento="${dia}"]`
                                                    ) as HTMLInputElement)?.value ?? '18:00'
                                                )}
                                            />
                                            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>até</span>
                                            <input
                                                type="time"
                                                data-fechamento={dia}
                                                defaultValue={horario?.fechamento ?? '18:00'}
                                                style={{ ...inputStyle, width: 110 }}
                                                onBlur={e => handleSaveHorario(
                                                    dia,
                                                    (document.querySelector(
                                                        `input[type="time"]:not([data-fechamento])`
                                                    ) as HTMLInputElement)?.value ?? '08:00',
                                                    e.target.value
                                                )}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 13, color: 'var(--text-faint)', flex: 1 }}>
                                            Fechado
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Bloqueios */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
            }}>
                <div style={{
                    padding: '16px 20px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                            Bloqueios de horário
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                            Feriados, folgas e períodos sem atendimento
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBloqueioForm(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--text)', color: 'white',
                            fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                        }}
                    >
                        <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 13 }} />
                        Novo bloqueio
                    </button>
                </div>

                {showBloqueioForm && (
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                    }}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: 12, marginBottom: 12,
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: 'var(--text-faint)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>
                                    Data início
                                </label>
                                <input
                                    type="date"
                                    value={bloqueioForm.dataInicio}
                                    onChange={e => setBloqueioForm(p => ({
                                        ...p, dataInicio: e.target.value
                                    }))}
                                    style={{ ...inputStyle, width: '100%' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <label style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: 'var(--text-faint)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>
                                    Data fim
                                </label>
                                <input
                                    type="date"
                                    value={bloqueioForm.dataFim}
                                    onChange={e => setBloqueioForm(p => ({
                                        ...p, dataFim: e.target.value
                                    }))}
                                    style={{ ...inputStyle, width: '100%' }}
                                />
                            </div>
                            <div style={{
                                gridColumn: 'span 2',
                                display: 'flex', flexDirection: 'column', gap: 4,
                            }}>
                                <label style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: 'var(--text-faint)',
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                }}>
                                    Motivo (opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Feriado nacional, Férias..."
                                    value={bloqueioForm.motivo}
                                    onChange={e => setBloqueioForm(p => ({
                                        ...p, motivo: e.target.value
                                    }))}
                                    style={{ ...inputStyle, width: '100%' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <input
                                type="checkbox"
                                id="diaInteiro"
                                checked={bloqueioForm.diaInteiro}
                                onChange={e => setBloqueioForm(p => ({
                                    ...p, diaInteiro: e.target.checked
                                }))}
                            />
                            <label htmlFor="diaInteiro" style={{
                                fontSize: 13, color: 'var(--text)', cursor: 'pointer',
                            }}>
                                Bloquear dia inteiro
                            </label>
                        </div>

                        {!bloqueioForm.diaInteiro && (
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: 12, marginBottom: 12,
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <label style={{
                                        fontSize: 11, fontWeight: 600,
                                        color: 'var(--text-faint)',
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                    }}>
                                        Hora início
                                    </label>
                                    <input
                                        type="time"
                                        value={bloqueioForm.horaInicio}
                                        onChange={e => setBloqueioForm(p => ({
                                            ...p, horaInicio: e.target.value
                                        }))}
                                        style={{ ...inputStyle, width: '100%' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <label style={{
                                        fontSize: 11, fontWeight: 600,
                                        color: 'var(--text-faint)',
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                    }}>
                                        Hora fim
                                    </label>
                                    <input
                                        type="time"
                                        value={bloqueioForm.horaFim}
                                        onChange={e => setBloqueioForm(p => ({
                                            ...p, horaFim: e.target.value
                                        }))}
                                        style={{ ...inputStyle, width: '100%' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => setShowBloqueioForm(false)}
                                style={{
                                    padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    background: 'var(--bg-card)', color: 'var(--text-muted)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCriarBloqueio}
                                style={{
                                    padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    background: 'var(--text)', color: 'white', border: 'none',
                                }}
                            >
                                Salvar bloqueio
                            </button>
                        </div>
                    </div>
                )}

                {loadingBloqueios ? (
                    <div style={{ padding: 20 }}>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} style={{
                                height: 48, background: 'var(--bg-surface)',
                                borderRadius: 'var(--radius-sm)', marginBottom: 8,
                            }} />
                        ))}
                    </div>
                ) : bloqueios.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>
                            Nenhum bloqueio cadastrado
                        </div>
                    </div>
                ) : (
                    <div>
                        {bloqueios.map((b, idx) => (
                            <div key={b.id} style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                padding: '12px 20px',
                                borderBottom: idx < bloqueios.length - 1
                                    ? '1px solid var(--border)' : 'none',
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: 'var(--danger)', flexShrink: 0,
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                                        {b.dataInicio === b.dataFim
                                            ? format(parseISO(b.dataInicio), "dd 'de' MMMM yyyy", { locale: ptBR })
                                            : `${format(parseISO(b.dataInicio), "dd/MM/yyyy")} → ${format(parseISO(b.dataFim), "dd/MM/yyyy")}`
                                        }
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
                                        {b.diaInteiro
                                            ? 'Dia inteiro'
                                            : `${b.horaInicio?.slice(0, 5)} às ${b.horaFim?.slice(0, 5)}`
                                        }
                                        {b.motivo && ` · ${b.motivo}`}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeletarBloqueio(b.id)}
                                    style={{
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', color: 'var(--danger)', fontSize: 16,
                                    }}
                                    aria-label="Remover bloqueio"
                                >
                                    <i className="ti ti-trash" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}