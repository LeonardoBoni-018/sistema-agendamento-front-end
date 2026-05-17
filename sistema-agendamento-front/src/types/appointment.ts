export type AppointmentStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'CANCELED'
    | 'FINISHED'

export interface Appointment {
    id: number
    userId: number
    userName: string
    jobId: number
    jobName: string
    jobPrice: number
    jobDurationMinutes: number
    date: string
    time: string
    status: AppointmentStatus
    createdAt: string
    updatedAt: string
}

export interface CreateAppointmentRequest {
    jobId: number
    date: string
    time: string
}