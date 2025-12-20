import { ShowToast, getErrorMessage } from '@/lib';
import { useMutation } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
import { ApprovalRequest } from '../approvalApi';
import { ApplicationForm, IAssignedTask, IResolvedTask } from '../itFormApi';

interface Create {
    OrgPositionIdUserCreatedForm: number;
    UserCodeCreatedForm?: string | null;
    UserNameCreatedForm?: string | null;
    OrgPositionId: number;
    UserCode?: string | null;
    UserName?: string | null;
    DepartmentName?: string | null;
    DepartmentId?: number | null;
    Position?: string | null;
    Unit?: string | null;
    DateJoinCompany?: string | null;
    LastWorkingDate?: string | null;
    Reason?: string;
    HandOver?: string;
}

export interface ResignationLetter {
    Id: number;
    ApplicationFormId?: number | null;
    UserCode?: string | null;
    UserName?: string | null;
    DepartmentName?: string | null;
    DepartmentId?: number | null;
    Position?: string | null;
    Unit?: string | null;
    OrgPositionId?: number | null;
    DateJoinCompany?: string | null;
    LastWorkingDate?: string | null;
    Reason?: string | null;
    HandOver?: string | null;
    CreatedAt?: string | null;
    UpdatedAt?: string | null;
    DeletedAt?: string | null;
    ApplicationForm?: ApplicationForm | null;
}

const resignationLetterApi = {
    getAll() {
        return axiosClient.get(`/resignation-letter`)
    },

    getByApplicationFormCode(applicationFormCode: string) {
        return axiosClient.get(`/resignation-letter/${applicationFormCode}`)
    },
    
    create(data: Create) {
        return axiosClient.post(`/resignation-letter`, data)
    },

    update(id: number, data: Create) {
        return axiosClient.put(`/resignation-letter/${id}`, data)
    },

    delete(id: number) {
        return axiosClient.delete(`/resignation-letter/${id}`)
    },

    approval(data: ApprovalRequest) {
        return axiosClient.post(`/resignation-letter/approval`, data)
    },

    assigedTask(data: IAssignedTask) {
        return axiosClient.post(`/resignation-letter/assigned-task`, data)
    },

    resolvedTask(data: IResolvedTask) {
        return axiosClient.post(`/resignation-letter/resolved-task`, data)
    },

    exportExcel(applicationFormCode: string) {
        return axiosClient.get(`/resignation-letter/export-excel/${applicationFormCode}`, {
            responseType: 'blob'
        })
    },
}

export function useExportExcelResignation() {
    return useMutation({
        mutationFn: async (applicationFormCode: string) => {
            const response = await resignationLetterApi.exportExcel(applicationFormCode)

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

export function useResolvedTaskResignationLetter () {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await resignationLetterApi.resolvedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAssignedTasResignationLetter () {
    return useMutation({
        mutationFn: async (data: IAssignedTask) => {
            await resignationLetterApi.assigedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalResignationLetter () {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await resignationLetterApi.approval(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateResignationLetter () {
    return useMutation({
        mutationFn: async (data: Create) => {
            await resignationLetterApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateResignationLetter() {
    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: Create}) => {
            await resignationLetterApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteResignationLetter () {
    return useMutation({
        mutationFn: async (id: number) => {
            await resignationLetterApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default resignationLetterApi;