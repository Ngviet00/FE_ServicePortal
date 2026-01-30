import { useMutation } from '@tanstack/react-query';
import { IRole } from './roleApi';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';

interface DataUserRole {
    user_code: string,
    role_ids: number[]
}

interface DataUserPermission {
    user_code: string,
    permission_ids: number[]
}

interface GetUser {
    Page?: number;
    PageSize?: number;
    Name?: string;
    Sex?: number | null,
    DepartmentId?: number | null,
    Status?: number | null,
    SetOrgPosition?: boolean | null,
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

export interface GetListUserData {
    id: string,
    nvMaNV: string,
    nvHoTen?: string,
    departmentName?: string,
    cvTen?: string,
    nvGioiTinh?: boolean,
    nvDienThoai?: string,
    nvEmail?: string,
    nvNgaySinh: string,
    nvNgayVao?: string,
    nvNgayRa?: string,
    statusUser?: boolean,
    roles: IRole[]
}

export interface UpdatePersonalInfo {
    email: string,
    phone?: string | null | undefined,
    dateOfBirth?: string
}

export interface UpdateUserMngTimeKeeping {
    userCode: string,
    orgUnitId: number[]
}

export interface ISelectedUserAssigned {
    userCode: string;
    userName: string
    email: string;
}

const userApi = {
    getAll(params: GetUser) {
        return axiosClient.get('/user', {params})
    },
    getById(id: string | undefined) {
        return axiosClient.get(`/user/get-by-id/${id}`)
    },
    getByCode(code: string | undefined) {
        return axiosClient.get(`/user/get-by-code/${code}`)
    },
    update(userCode: string | undefined, data: UpdatePersonalInfo){
        return axiosClient.put(`/user/${userCode}`, data)
    },
    delete(id: string) {
        return axiosClient.delete(`/user/delete/${id}`)
    },
    orgChart(department_id: number) {
        return axiosClient.get(`/user/org-chart?departmentId=${department_id}`)
    },
    updateUserRole(data: DataUserRole) {
        return axiosClient.post(`/user/update-user-role`, data)
    },
    updateUserPermission(data: DataUserPermission) {
        return axiosClient.post(`/user/update-user-permission`, data)
    },
    resetPassword (data: ResetPasswordRequest) {
        return axiosClient.post(`/user/reset-password`, data)
    },
    getMe() {
        return axiosClient.get(`/user/me`)
    },
    getRoleAndPermissionOfUser(userCode: string) {
        return axiosClient.get(`/user/get-role-permission-user?userCode=${userCode}`)
    },
    GetMultipleUserByOrgPositionIdOrUserCodes(orgPositionId: number) {
        return axiosClient.get(`/user/get-multiple-user-by-org-position-id/${orgPositionId}`)
    },

    importUserExcel(data: FormData) {
        return axiosClient.post('/user/import-user-by-excel', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    importUserLeavingExcel(data: FormData) {
        return axiosClient.post('/user/import-user-leaving-by-excel', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
}

export function useImportUserLeavingExcel() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await userApi.importUserLeavingExcel(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err) ?? 'Error', "error");
        }
    })
}

export function useImportUserExcel() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await userApi.importUserExcel(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateUserRole () {
    return useMutation({
        mutationFn: async (request: DataUserRole) => {
            await userApi.updateUserRole(request)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateUserPermission () {
    return useMutation({
        mutationFn: async (request: DataUserPermission) => {
            await userApi.updateUserPermission(request)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
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

export function useUpdatePersonalInfo() {
    return useMutation({
        mutationFn: async ({userCode, data} : {userCode: string | undefined, data: UpdatePersonalInfo}) => {
            await userApi.update(userCode, data)
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