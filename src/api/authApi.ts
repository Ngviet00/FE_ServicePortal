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
    code: string | null,
    name: string | null,
    password: string | null,
    email: string | null,
    date_join_company: string | null,
    date_of_birth: string | null,
    phone: string | null,
    sex: number | null,
    level: string,
    level_parent: string,
    position: string | null,
    role_id: number | null,
    department_id: number | null,
}

const authApi = {
    login: (data: LoginRequest) => {
        return axiosClient.post('/auth/login', data);
    },

    register(data: RegisterRequest) {
        return axiosClient.post("/auth/register", data);
    },

    logout () {
        return axiosClient.post("/auth/logout");
    },

    changePassword(data: ChangePasswordRequest) {
        return axiosClient.post("/auth/change-password", data);
    }
}

export default authApi;