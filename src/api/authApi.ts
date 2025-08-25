import axiosClient from './axiosClient';

interface LoginRequest {
    userCode: string
    password: string
}

interface ChangePasswordRequest {
    newPassword: string 
    confirmPassword: string
    email?: string
}

export interface RegisterRequest {
    userCode: string
}

interface RefreshTokenRequest {
    refreshToken: string | null,
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