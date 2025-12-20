import { ShowToast, getErrorMessage } from '@/lib';
import { useMutation } from '@tanstack/react-query';
import { ApplicationForm, IResolvedTask } from '../itFormApi';
import axiosClient from '../axiosClient';
import { ApprovalRequest } from '../approvalApi';

interface GetAll {
    UserCode?: string,
    Page: number,
    PageSize: number,
}

interface Create {
    OrgPositionIdUserCreatedForm?: number;
    UserCodeCreatedForm?: string;
    UserNameCreatedForm?: string;
    OrgPositionId?: number;
    UserCode?: string;
    UserName?: string;
    DepartmentName?: string;
    DepartmentId?: number;
    Position?: string;
    Unit?: string;
    DateJoinCompany?: string;
    LastWorkingDate?: string;
    ContractTerminationDate?: string;
    Reason?: string;
    HandOver?: string;
}

export interface TerminationLetter {
    id: number;
    applicationFormId?: number;
    userCode?: string;
    userName?: string;
    departmentName?: string;
    departmentId?: number;
    position?: string;
    unit?: string;
    dateJoinCompany?: string;
    lastWorkingDate?: string;
    contractTerminationDate?: string;
    reason?: string;
    handOver?: string;
    createdAt?: string;
    updatedAt?: string;
    applicationForm?: ApplicationForm;
}

interface HrConfirmAbsent {
    userCode?: string,
    lastAbsent?: string,
    status: boolean,
    userConfirm?: string
}

const terminationLetterApi = {
    getAll(params: GetAll) {
        return axiosClient.get(`/termination-letter`, {params})
    },

    getByApplicationFormCode(applicationFormCode: string) {
        return axiosClient.get(`/termination-letter/${applicationFormCode}`)
    },
    
    create(data: Create) {
        return axiosClient.post(`/termination-letter`, data)
    },

    update(id: number, data: Create) {
        return axiosClient.put(`/termination-letter/${id}`, data)
    },

    delete(id: number) {
        return axiosClient.delete(`/termination-letter/${id}`)
    },

    approval(data: ApprovalRequest) {
        return axiosClient.post(`/termination-letter/approval`, data)
    },

    resolvedTask(data: IResolvedTask) {
        return axiosClient.post(`/termination-letter/resolved-task`, data)
    },

    exportExcel(applicationFormCode: string) {
        return axiosClient.get(`/termination-letter/export-excel/${applicationFormCode}`, {
            responseType: 'blob'
        })
    },

    getListAbsentOverDay(params: GetAll) {
        return axiosClient.get(`/termination-letter/hr-get-list-absent`, {params})
    },

    hrConfirmAbsent(data: HrConfirmAbsent) {
        return axiosClient.post(`/termination-letter/hr-confirm-absent`, data)
    }
}

export function useHRConfirmAbsent () {
    return useMutation({
        mutationFn: async (data: HrConfirmAbsent) => {
            await terminationLetterApi.hrConfirmAbsent(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export function useExportExcelTerminationLetter() {
    return useMutation({
        mutationFn: async (applicationFormCode: string) => {
            const response = await terminationLetterApi.exportExcel(applicationFormCode)

            const contentDisposition = response.headers['content-disposition'] || '';
            let fileName = 'Report.xlsx';

            const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/i);
            if (match?.[1]) {
                fileName = match[1];
                fileName = decodeURIComponent(fileName);
                fileName = fileName.replace(/\s+/g, '_');
            }

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
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

export function useResolvedTaskTerminationLetter () {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await terminationLetterApi.resolvedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalTerminationLetter () {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await terminationLetterApi.approval(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateTerminationLetter () {
    return useMutation({
        mutationFn: async (data: Create) => {
            await terminationLetterApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateTerminationLetter() {
    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: Create}) => {
            await terminationLetterApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteTerminationLetter () {
    return useMutation({
        mutationFn: async (id: number) => {
            await terminationLetterApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default terminationLetterApi;