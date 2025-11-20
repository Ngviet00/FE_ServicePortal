import axiosClient from './axiosClient';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import { ApprovalRequest } from './approvalApi';

const sapApi = {
    getListStaffByDepartmentId: (departmentId: number) => {
        return axiosClient.get(`/sap/get-list-staff-by-department-id?departmentId=${departmentId}`);
    },
    updateUserHaveRoleSAP (UserCodes: string[]) {
        return axiosClient.post(`/sap/update-user-have-role-sap`, UserCodes);
    },
    createSAP(formData: FormData) {
        return axiosClient.post('/sap', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    delete(applicationFormCode: string) {
        return axiosClient.delete(`/sap/${applicationFormCode}`)
    },
    getListSAPRegistered(params: { Page: number; PageSize: number; UserCode?: string; }) {
        return axiosClient.get(`/sap`, {params});
    },
    getAllSAPType () {
        return axiosClient.get(`/sap/sap-type`);
    },
    getDetailFormSAP(applicationFormCode: string) {
        return axiosClient.get(`/sap/${applicationFormCode}`);
    },
    approval(data: ApprovalRequest) {
        return axiosClient.post(`/sap/approval`, data)
    },
}

export function useApprovalSAP() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await sapApi.approval(data)
        },
        onSuccess: () => {
            ShowToast('success')
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteSAP() {
    return useMutation({
        mutationFn: async (applicationFormCode: string) => {
            await sapApi.delete(applicationFormCode)
        },
        onSuccess: () => {
            ShowToast('success')
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateSAP() {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            await sapApi.createSAP(formData)
        },
        onSuccess: () => {
            ShowToast('success')
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateUserHaveRoleSAP() {
    return useMutation({
        mutationFn: async (UserCodes: string[]) => {
            await sapApi.updateUserHaveRoleSAP(UserCodes)
        },
        onSuccess: () => {
            ShowToast('success')
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default sapApi;