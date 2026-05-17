export interface User {
    id: number
    name: string
    email: string
    phone: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    name: string
    email: string
    phone: string
    password: string
}

export interface TokenResponse {
    accessToken: string
    refreshToken: string
    expiresIn: number
}