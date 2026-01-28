import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

interface ResponseFeedback {
    feedbackId: number,
    contentResponse: string
}

const feedbackApi = {
    create(formData: FormData) {
        return axiosClient.post('/feedback', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    update(id: number, data: FormData){
        return axiosClient.put(`/feedback/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    getAllFeedback(params: {page: number, pageSize: number, status?: number}) {
        return axiosClient.get(`/feedback`, {params})
    },

    getByCode(code: string) {
        return axiosClient.get(`/feedback/${code}`)
    },

    getMyFeedback(params: {page: number, pageSize: number}) {
        return axiosClient.get(`/feedback/get-my-feedback`, {params})
    },

    getFeedbackPendingResponse(params: {page: number, pageSize: number}) {
        return axiosClient.get(`/feedback/get-feedback-pending-response`, {params})
    },

    delete(id: number) {
        return axiosClient.delete(`/feedback/${id}`)
    },

    responseFeedback(data: ResponseFeedback) {
        return axiosClient.post('/feedback/response-feedback', data)
    }
}

export function useResponseFeedback () {
    return useMutation({
        mutationFn: async (data: ResponseFeedback) => {
            await feedbackApi.responseFeedback(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteFeedback () {
    return useMutation({
        mutationFn: async (id: number) => {
            await feedbackApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateFeedback() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await feedbackApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateFeedback() {
    return useMutation({
        mutationFn: async ({id, data} : { id: number, data: FormData } ) => {
            await feedbackApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default feedbackApi;