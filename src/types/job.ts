export interface Job {
    id: number
    name: string
    description: string
    price: number
    durationMinutes: number
    comercioId: number
    comercioNome: string
}

export interface CreateJobRequest {
    name: string
    description: string
    price: number
    durationMinutes: number
}

export interface UpdateJobRequest {
    name?: string
    description?: string
    price?: number
    durationMinutes?: number
}