import { IApplicationForm } from './../lib/index';
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';
import { OrgUnit } from './orgUnitApi';

interface GetAll {
    UserCode?: string,
    Page: number
    PageSize: number
}

interface GetMemoNotifyWaitApproval {
    OrgUnitId?: number,
    Page: number
    PageSize: number
}

interface GetHistoryMemoNotifyWaitApproval {
    currentUserCode?: string,
    Page: number
    PageSize: number
}

export interface HistoryApproval {
    action?: string,
    note?: string,
    createdAt?: string | Date,
    userNameApproval?: string,
    userCodeApproval?: string
}

export interface IMemoNotify {
    id?: string;
    title: string;
    content: string
    createdByDepartmentId: number | null | undefined;
    departmentIdApply: number[],
    fromDate: Date | string | undefined;
    toDate: Date | string | undefined;
    status: boolean,
    userCodeCreated: string | undefined,
    createdBy?: string | null | undefined,
    createdAt?: Date | string | undefined,
    updatedBy?: string,
    updatedAt?: Date,
    applyAllDepartment: boolean,
    attachments: File[],
    memoNotificationDepartments?: IMemoNotifyDepartment[],
    
    applicationForm?: IApplicationForm
};

export interface IMemoNotifyDepartment {
    id?: string | null
    memoNotificationId?: string
    departmentId?: number,
    orgUnit: OrgUnit
}

const memoNotificationApi = {
    getAll(params: GetAll) {
        return axiosClient.get('/memo-notification', {params})
    },

    getWaitApproval(params: GetMemoNotifyWaitApproval) {
        return axiosClient.get('/memo-notification/get-all-wait-approval', {params})
    },

    getHistoryApproval(params: GetHistoryMemoNotifyWaitApproval) {
        return axiosClient.get('/memo-notification/get-all-history-approval', {params})
    },

    getAllInHomePage(params: {DepartmentId: number | null |undefined }) {
        return axiosClient.get('/memo-notification/get-all-in-homepage', {params})
    },

    getById(id: string) {
        return axiosClient.get(`/memo-notification/${id}`)
    },

    create(formData: FormData) {
        return axiosClient.post('/memo-notification', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    update(id: string, formData: FormData){
        return axiosClient.put(`/memo-notification/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    delete(id: string | undefined) {
        return axiosClient.delete(`/memo-notification/${id}`)
    },

    downloadFile(id: string) {
        return axiosClient.get(`/memo-notification/download/${id}`, {
            responseType: 'blob',
        })
    }
}

export function useCreateMemoNotification() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await memoNotificationApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateMemoNotification() {
    return useMutation({
        mutationFn: async ({id, data} : {id: string, data: FormData}) => {
            await memoNotificationApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export function useDeleteMemoNotification() {
    return useMutation({
        mutationFn: async (id: string | undefined) => {
            await memoNotificationApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default memoNotificationApi;