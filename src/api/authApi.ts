import axiosClient from './axiosClient';

export interface User {
    id: string;
    name: string;
    email: string;
    code: string;
}

const authApi = {
    login: (data: { user_code : string; password: string }) => {
        return axiosClient.post('/auth/login', data);
    },

    register(data: { employeeCode: string; password: string }) {
        return axiosClient.post("/auth/register", data);
    },

    logout () {
        return axiosClient.post("/auth/logout");
    },

    changePassword(data: { new_password: string; confirm_password: string}) {
        return axiosClient.post("/auth/change-password", data);
    },
}

export default authApi;