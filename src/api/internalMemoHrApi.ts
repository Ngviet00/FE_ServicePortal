/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';
import { ApprovalRequest } from './approvalApi';

interface ListInternalMemoRequest {
    UserCode?: string,
    Page?: number,
    PageSize?: number,
    Status?: number | null
}

const internalMemoHrApi = {
    create(data: any) {
        return axiosClient.post('/internal-memo-hr', data)
    },
    list(params: ListInternalMemoRequest) {
        return axiosClient.get('/internal-memo-hr', {params})
    },
    update(applicationFormCode: string, data: any) {
        return axiosClient.put(`/internal-memo-hr/${applicationFormCode}`, data)
    },
    delete(applicationFormCode: string) {
        return axiosClient.delete(`/internal-memo-hr/${applicationFormCode}`)
    },
    getDetailInternalMemoHr(applicationFormCode: string) {
        return axiosClient.get(`/internal-memo-hr/${applicationFormCode}`)
    },
    approvalInternalMemoHr(data: ApprovalRequest) {
        return axiosClient.post(`/internal-memo-hr/approval`, data)
    },
}

export function useApprovalInternalMemo() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await internalMemoHrApi.approvalInternalMemoHr(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateInternalMemo() {
    return useMutation({
        mutationFn: async (data: any) => {
            await internalMemoHrApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateInternalMemo() {
    return useMutation({
        mutationFn: async ({applicationFormCode, data} : { applicationFormCode: string, data: any } ) => {
            await internalMemoHrApi.update(applicationFormCode, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default internalMemoHrApi;