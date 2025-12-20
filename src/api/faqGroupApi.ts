import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { FAQ } from './faqApi';
import { getErrorMessage, ShowToast } from '@/lib';

interface GetAllParams {
    page: number;
    pageSize: number;
}

export interface FAQGroup {
    id?: number | null;
    title?: string;
    titleV?: string;
    faQs?: FAQ[]
};

const faqGroupApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/faq-group', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/faq-group/${id}`)
    },
    create(data: FAQGroup) {
        return axiosClient.post('/faq-group', data)
    },
    update(id: number, data: FAQGroup){
        return axiosClient.put(`/faq-group/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/faq-group/${id}`)
    }
}

export function useDeleteFAQGroup() {
    return useMutation({
        mutationFn: async (id: number) => {
            await faqGroupApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default faqGroupApi;