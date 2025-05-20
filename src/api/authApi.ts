import axiosClient from './axiosClient';

export interface User {
    id: string;
    name: string;
    email: string;
    code: string;
}

interface LoginRequest {
    user_code: string
    password: string
}

interface ChangePasswordRequest {
    new_password: string 
    confirm_password: string
}

export interface RegisterRequest {
    Usercode: string | null,
    Password: string | null,
}

interface RefreshTokenRequest {
    RefreshToken: string | null,
}

const authApi = {
    login: (data: LoginRequest) => {
        return axiosClient.post('/auth/login', data);
    },

    register(data: RegisterRequest) {
        return axiosClient.post("/auth/register", data);
    },

    logout (data: RefreshTokenRequest) {
        return axiosClient.post("/auth/logout", data);
    },

    refreshAccessToken(data: RefreshTokenRequest) {
        return axiosClient.post("/auth/refresh-token", data);
    },

    changePassword(data: ChangePasswordRequest) {
        return axiosClient.post("/auth/change-password", data);
    }
}

export default authApi;