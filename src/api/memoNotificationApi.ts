import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';

interface GetAll {
    currentUserCode?: string,
    RoleName: string | null | undefined
    Page: number
    PageSize: number
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
    departmentNames?: string
};

const memoNotificationApi = {
    getAll(params: GetAll) {
        return axiosClient.get('/memo-notification/get-all', {params})
    },

    getAllInHomePage(params: {DepartmentId: number | null |undefined }) {
        return axiosClient.get('/memo-notification/get-all-in-homepage', {params})
    },

    getById(id: string) {
        return axiosClient.get(`/memo-notification/${id}`)
    },

    create(formData: FormData) {
        return axiosClient.post('/memo-notification/create', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    update(id: string, formData: FormData){
        return axiosClient.put(`/memo-notification/update/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    delete(id: string | undefined) {
        return axiosClient.delete(`/memo-notification/delete/${id}`)
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