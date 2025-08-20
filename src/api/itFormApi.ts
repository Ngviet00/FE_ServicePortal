import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';

interface GetAll {
    currentUserCode?: string,
    Page: number
    PageSize: number
}

interface CreateITFormRequest {
    UserCodeRequestor: string
}

interface UpdateITFormRequest {
    UserCodeRequestor: string
}

const itFormApi = {
    getAll(params: GetAll) {
        return axiosClient.get('/it-form', {params})
    },

    getById(id: string) {
        return axiosClient.get(`/it-form/${id}`)
    },

    create(data: CreateITFormRequest) {
        return axiosClient.post('/it-form', data)
    },

    update(id: string, data: UpdateITFormRequest){
        return axiosClient.post(`/it-form/${id}`, data)
    },

    delete(id: string | undefined) {
        return axiosClient.delete(`/it-form/${id}`)
    }
}

export function useCreateMemoNotification() {
    return useMutation({
        mutationFn: async (data: CreateITFormRequest) => {
            await itFormApi.create(data)
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
        mutationFn: async ({id, data} : {id: string, data: UpdateITFormRequest}) => {
            await itFormApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteITForm() {
    return useMutation({
        mutationFn: async (id: string | undefined) => {
            await itFormApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default itFormApi;