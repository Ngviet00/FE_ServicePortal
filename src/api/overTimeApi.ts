 
import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

interface MyOverTimeRequest {
    UserCode?: string,
    Page?: number,
    PageSize?: number,
    Status?: number | null
}

interface RejectSomeOverTimeRequest {
    overTimeIds: number[], 
    note?: string, 
    userCodeReject?: string, 
    userNameReject?: string,
    orgPositionId?: number
    applicationFormCode?: string
}

interface HrNoteOverTimeRequest {
    UserCode?: string,
    ApplicationFormId?: number,
    OverTimeId?: number,
    NoteOfHr?: string,
}

const overTimeApi = {
    getTypeOverTime() {
        return axiosClient.get(`/overtime/type-overtime`)
    },
    create(data: FormData) {
        return axiosClient.post('/overtime', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    getMyOverTime(params: MyOverTimeRequest) {
        return axiosClient.get(`/overtime/get-my-overtime`, {params})
    },
    getOverTimeRegister(params: MyOverTimeRequest) {
        return axiosClient.get(`/overtime/get-overtime-register`, {params})
    },
    delete(applicationFormCode: string) {
        return axiosClient.delete(`/overtime/${applicationFormCode}`)
    },
    getDetailOverTime(applicationFormCode: string) {
        return axiosClient.get(`/overtime/${applicationFormCode}`)
    },
    update(applicationFormCode: string, data: FormData) {
        return axiosClient.put(`/overtime/${applicationFormCode}`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    rejectSomeOverTimes(data: RejectSomeOverTimeRequest) {
        return axiosClient.post('/overtime/reject-some-overtimes', data)
    },
    HrNote(data: HrNoteOverTimeRequest) {
        return axiosClient.post('/overtime/hr-note', data)
    }
}

export function useHrNoteOverTime() {
    return useMutation({
        mutationFn: async (data: HrNoteOverTimeRequest) => {
            await overTimeApi.HrNote(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useRejectSomeOverTime() {
    return useMutation({
        mutationFn: async (data: RejectSomeOverTimeRequest) => {
            await overTimeApi.rejectSomeOverTimes(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateOverTime() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await overTimeApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateOverTime() {
    return useMutation({
        mutationFn: async ({applicationFormCode, data} : { applicationFormCode: string, data: FormData } ) => {
            await overTimeApi.update(applicationFormCode, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default overTimeApi;