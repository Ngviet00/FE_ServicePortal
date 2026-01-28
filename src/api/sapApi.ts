import axiosClient from './axiosClient';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import { ApprovalRequest } from './approvalApi';

const sapApi = {
    createSAP(formData: FormData) {
        return axiosClient.post('/sap', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    delete(applicationFormId: number) {
        return axiosClient.delete(`/sap/${applicationFormId}`)
    },
    getListSAPRegistered(params: { Page: number; PageSize: number; UserCode?: string; }) {
        return axiosClient.get(`/sap`, {params});
    },
    getDetailFormSAP(applicationFormCode: string) {
        return axiosClient.get(`/sap/${applicationFormCode}`);
    },
    getAllSAPType () {
        return axiosClient.get(`/sap/sap-type`);
    },
    preparePreviewExcel(token: string) {
        return axiosClient.get(`/sap/prepare-preview-excel/${token}`);
    },
    



    getListStaffByDepartmentId: (departmentId: number) => {
        return axiosClient.get(`/sap/get-list-staff-by-department-id?departmentId=${departmentId}`);
    },
    updateUserHaveRoleSAP (UserCodes: string[]) {
        return axiosClient.post(`/sap/update-user-have-role-sap`, UserCodes);
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
        mutationFn: async (applicationFormId: number) => {
            await sapApi.delete(applicationFormId)
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