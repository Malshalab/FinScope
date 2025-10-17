import apiClient from "./client";

export interface LoginRequest{
    email:string ;
    password: string ;
}

export interface TokenResponse {
    access_token: string ;
    token_type:string ;
}
export interface RegisterRequest{
    fullName: string ;
    email: string ;
    password: string ;
}

export async function login(data: LoginRequest) : Promise<TokenResponse>{
    const res= await apiClient.post<TokenResponse>("/users/login", data) ;
    return res.data ;
}

export async function register(data: RegisterRequest) : Promise<TokenResponse>{
    const res= await apiClient.post<TokenResponse>("/users/register", data) ;
    return res.data ;
}
