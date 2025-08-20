import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

export interface ITCategoryInterface {
    id?: number,
    name: string,
    code?: string
}

const itCategoryApi = {
    getAll() {
        return axiosClient.get('/it-category')
    },
    getById(id: number) {
        return axiosClient.get(`/it-category/${id}`)
    },
    create(data: ITCategoryInterface) {
        return axiosClient.post('/it-category', data)
    },
    update(id: number, data: ITCategoryInterface){
        return axiosClient.put(`/it-category/${id}`, data)
    },
    delete(id: number | undefined) {
        return axiosClient.delete(`/it-category/${id}`)
    }
}

export function useDeleteITCategory() {
    return useMutation({
        mutationFn: async (id: number | undefined) => {
            await itCategoryApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default itCategoryApi;