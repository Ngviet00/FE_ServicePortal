import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

export interface IPriority {
    id?: number,
    name: string,
    nameE: string
}

const priorityApi = {
    getAll() {
        return axiosClient.get('/priority')
    },
    getById(id: number) {
        return axiosClient.get(`/priority/${id}`)
    },
    create(data: IPriority) {
        return axiosClient.post('/priority', data)
    },
    update(id: number, data: IPriority){
        return axiosClient.put(`/priority/${id}`, data)
    },
    delete(id: number | undefined) {
        return axiosClient.delete(`/priority/${id}`)
    }
}

export function useDeletePriority() {
    return useMutation({
        mutationFn: async (id: number | undefined) => {
            await priorityApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default priorityApi;