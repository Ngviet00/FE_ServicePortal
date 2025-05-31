import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';

interface GetAll {
    Page: number;
    PageSize: number;
}

export interface IMemoNotify {
    id?: string;
    title: string;
    content: string;
    createdByDepartmentId: number;
    // departmentIdApply: string[],
    fromDate: Date | string | undefined;
    toDate: Date | string | undefined;
    status: boolean,
    userCodeCreated: string | undefined,
    createdBy?: string,
    createdAt?: Date | string | undefined,
    updatedBy?: string,
    updatedAt?: Date,
    applyAllDepartment: boolean
};

const memoNotificationApi = {
    getAll(params: GetAll) {
        return axiosClient.get('/memo-notification/get-all', {params})
    },

    getAllInHomePage() {
        return axiosClient.get('/memo-notification/get-all-in-homepage')
    },

    getById(id: string) {
        return axiosClient.get(`/memo-notification/${id}`)
    },

    create(data: IMemoNotify) {
        return axiosClient.post('/memo-notification/create', data)
    },

    update(id: string, data: IMemoNotify){
        return axiosClient.put(`/memo-notification/update/${id}`, data)
    },

    delete(id: string | undefined) {
        return axiosClient.delete(`/memo-notification/delete/${id}`)
    }
}

export function useCreateMemoNotification() {
    return useMutation({
        mutationFn: async (data: IMemoNotify) => {
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
        mutationFn: async ({id, data} : {id: string, data: IMemoNotify}) => {
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