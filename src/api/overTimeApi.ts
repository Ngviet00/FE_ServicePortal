 
import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';
import { ApprovalRequest } from './approvalApi';
import { IResolvedTask } from './itFormApi';

interface MyOverTimeRequest {
    UserCode?: string,
    Page?: number,
    PageSize?: number,
    Status?: number | null
}

interface RejectSomeOverTimeRequest {
    applicationFormItemIds: number[], 
    note?: string, 
    userCodeReject?: string, 
    userNameReject?: string,
    orgPositionId?: number
    applicationFormCode?: string,
    applicationFormId?: number
}

interface HrNoteOverTimeRequest {
    UserCode?: string,
    ApplicationFormId?: number,
    OverTimeId?: number,
    NoteOfHr?: string,
}

export interface CreateOverTimeRequest {
    orgPositionIdUserCreatedForm?: number | null;
    userCodeCreatedForm?: string | null;
    userNameCreatedForm?: string | null;
    departmentIdUserCreatedForm?: number | null;
    infoOverTime?: string | null;
    createListOverTimeRequests: CreateListOverTimeRequest[];
}
export interface CreateListOverTimeRequest {
    id?: number | null;
    userCode?: string | null;
    userName?: string | null;
    position?: string | null;
    fromHour?: string | null;
    toHour?: string | null;
    numberHour?: string | null;
    note?: string | null;
    noteOfHR?: string | null;
}

const overTimeApi = {
    getTypeOverTime() {
        return axiosClient.get(`/overtime/type-overtime`)
    },
    create(data: CreateOverTimeRequest) {
        return axiosClient.post('/overtime', data)
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
    update(applicationFormCode: string, data: CreateOverTimeRequest) {
        return axiosClient.put(`/overtime/${applicationFormCode}`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    rejectSomeOverTimes(data: RejectSomeOverTimeRequest) {
        return axiosClient.post('/overtime/reject-some-overtimes', data)
    },
    hrNote(data: HrNoteOverTimeRequest) {
        return axiosClient.post('/overtime/hr-note', data)
    },
    approvalOverTime(data: ApprovalRequest) {
        return axiosClient.post(`/overtime/approval`, data)
    },
    hrExportExcelOverTime(data: {applicationFormId: number}) {
        return axiosClient.post('/overtime/hr-export-excel-overtime', data, {
            responseType: 'blob'
        })
    },
    resolvedTaskOvertime(data: IResolvedTask) {
        return axiosClient.post(`/overtime/resolved`, data)
    },
}

export function useResolvedTaskOverTime () {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await overTimeApi.resolvedTaskOvertime(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useHrExportExcelOverTime() {
    return useMutation({
        mutationFn: async (data: {applicationFormId: number}) => {
            const response = await overTimeApi.hrExportExcelOverTime(data)

            const d = new Date();
            const f = (n: number, l: number) => n.toString().padStart(l, '0');
            const name = `OverTimes_${d.getFullYear()}_${f(d.getMonth()+1,2)}_${f(d.getDate(),2)}_${f(d.getHours(),2)}_${f(d.getMinutes(),2)}_${f(d.getSeconds(),2)}.xlsx`;

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

export function useApprovalOverTime() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await overTimeApi.approvalOverTime(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useHrNoteOverTime() {
    return useMutation({
        mutationFn: async (data: HrNoteOverTimeRequest) => {
            await overTimeApi.hrNote(data)
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
        mutationFn: async (data: CreateOverTimeRequest) => {
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
        mutationFn: async ({applicationFormCode, data} : { applicationFormCode: string, data: CreateOverTimeRequest } ) => {
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