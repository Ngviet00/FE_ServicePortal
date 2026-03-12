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
    userCode: string,
    password: string, 
    confirmPassword: string,
    email: string
}

interface RefreshTokenRequest {
    refreshToken: string | null,
}

interface CreateManualLoginAcc {
    userCode: string,
    password: string,
    confirmPassword: string
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
    },

    requestOtp: (userCode: string) => {
        return axiosClient.post('/auth/request-otp', { userCode });
    },

    verifyOtp: (data: {UserCode: string, Code: string}) => {
        return axiosClient.post('/auth/verify-otp', data);
    },
    
    createManualLoginAccount(data: CreateManualLoginAcc) {
        return axiosClient.post('/auth/create-manual-login-account', data)
    }
}

export default authApi;