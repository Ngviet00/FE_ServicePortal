import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

export interface FAQ {
    id?: number | null;
    question?: string;
    questionV?: string;
    answer?: string,
    answerV?: string,
    createdBy?: string,
    role?: string,
    faqGroupId?: number 
};

const faqApi = {
    getById(id: number) {
        return axiosClient.get(`/faq/${id}`)
    },
    create(data: FAQ) {
        return axiosClient.post('/faq', data)
    },
    update(id: number, data: FAQ){
        return axiosClient.put(`/faq/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/faq/${id}`)
    }
}

export function useCreateFAQ() {
    return useMutation({
        mutationFn: async (data: FAQ) => {
            await faqApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateFAQ() {
    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: FAQ}) => {
            await faqApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteFAQItem() {
    return useMutation({
        mutationFn: async (id: number) => {
            await faqApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default faqApi;