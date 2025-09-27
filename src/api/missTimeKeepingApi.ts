 
import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';
import { ApprovalRequest } from './approvalApi';

interface MyMissTimeKeepingRequest {
    UserCode?: string,
    Page?: number,
    PageSize?: number,
    Status?: number | null
}

interface HrNoteMissTimeKeepingRequest {
    UserCode?: string,
    ApplicationFormId?: number,
    MissTimeKeepingId?: number,
    NoteOfHr?: string,
}

const missTimeKeepingApi = {
    create(data: FormData) {
        return axiosClient.post('/miss-timekeeping', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    getMyMissTimeKeeping(params: MyMissTimeKeepingRequest) {
        return axiosClient.get(`/miss-timekeeping/get-my-miss-timekeeping`, {params})
    },
    getMissTimeKeepingRegister(params: MyMissTimeKeepingRequest) {
        return axiosClient.get(`/miss-timekeeping/get-miss-timekeeping-register`, {params})
    },
    delete(applicationFormCode: string) {
        return axiosClient.delete(`/miss-timekeeping/${applicationFormCode}`)
    },
    getDetailMissTimeKeeping(applicationFormCode: string) {
        return axiosClient.get(`/miss-timekeeping/${applicationFormCode}`)
    },
    update(applicationFormCode: string, data: FormData) {
        return axiosClient.put(`/miss-timekeeping/${applicationFormCode}`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    hrNote(data: HrNoteMissTimeKeepingRequest) {
        return axiosClient.post('/miss-timekeeping/hr-note', data)
    },
    approvalMissTimeKeeping(data: ApprovalRequest) {
        return axiosClient.post(`/miss-timekeeping/approval`, data)
    },
    hrExportExcelMissTimeKeeping(data: {applicationFormId: number}) {
        return axiosClient.post('/miss-timekeeping/hr-export-excel-miss-timekeeping', data, {
            responseType: 'blob'
        })
    },
}

export function useHrExportExcelMissTimeKeeping() {
    return useMutation({
        mutationFn: async (data: {applicationFormId: number}) => {
            const response = await missTimeKeepingApi.hrExportExcelMissTimeKeeping(data)

            const d = new Date();
            const f = (n: number, l: number) => n.toString().padStart(l, '0');
            const name = `Miss_TimeKeeping_${d.getFullYear()}_${f(d.getMonth()+1,2)}_${f(d.getDate(),2)}_${f(d.getHours(),2)}_${f(d.getMinutes(),2)}_${f(d.getSeconds(),2)}.xlsx`;

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalMissTimeKeeping() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await missTimeKeepingApi.approvalMissTimeKeeping(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useHrNoteMissTimeKeeping() {
    return useMutation({
        mutationFn: async (data: HrNoteMissTimeKeepingRequest) => {
            await missTimeKeepingApi.hrNote(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateMissTimeKeeping() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await missTimeKeepingApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateMissTimeKeeping() {
    return useMutation({
        mutationFn: async ({applicationFormCode, data} : { applicationFormCode: string, data: FormData } ) => {
            await missTimeKeepingApi.update(applicationFormCode, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default missTimeKeepingApi;