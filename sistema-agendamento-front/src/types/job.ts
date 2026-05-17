export interface Job {
    id: number
    name: string
    description: string
    price: number
    durationMinutes: number
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