import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { IRole } from './roleApi';
import { getErrorMessage, ShowToast } from '@/lib';

interface data {
    name: string | null
    email: string | null
    dateJoinCompany: Date
}

interface DataUserRole {
    user_code: string,
    role_ids: number[]
}

interface GetUser {
    page: number;
    page_size: number;
    name?: string;
}

interface ResetPasswordRequest {
    userCode: string | undefined,
    password: string | undefined
}

export interface ListUserData {
    id: string,
    userCode: string,
    positionId: string | null,
    isActive: number,
    isChangePassword: number,
    roles: IRole[]
}

const userApi = {
    getAll(params: GetUser) {
        return axiosClient.get('/user/get-all', {params})
    },
    getById(id: string | undefined) {
        return axiosClient.get(`/user/get-by-id/${id}`)
    },
    getByCode(code: string | undefined) {
        return axiosClient.get(`/user/get-by-code/${code}`)
    },
    update(id: number, data: data){
        return axiosClient.put(`/user/update/${id}`, data)
    },
    delete(id: string) {
        return axiosClient.delete(`/user/delete/${id}`)
    },
    orgChart(department_id: number) {
        return axiosClient.get(`/user/org-chart?department_id=${department_id}`)
    },
    updateUserRole(data: DataUserRole) {
        return axiosClient.post(`/user/update-user-role`, data)
    },
    resetPassword (data: ResetPasswordRequest) {
        return axiosClient.post(`/user/reset-password`, data)
    },
    getMe() {
        return axiosClient.get(`/user/me`)
    }
}

export function useResetPassword () {
    return useMutation({
        mutationFn: async (request: ResetPasswordRequest) => {
            await userApi.resetPassword(request)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default userApi;