import { ShowToast, getErrorMessage } from '@/lib';
import { useMutation } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
import { ApplicationForm, IAssignedTask, IResolvedTask } from '../itFormApi';
import { ApprovalRequest } from '../approvalApi';

interface GetAll {
    UserCode?: string,
    Page: number,
    PageSize: number,
    Type?: string
}

interface Create {
    UserCode: string | null;
    UserName: string | null;
    DepartmentName: string | null;
    DepartmentId: number | null;
    Position: string | null;
    OrgPositionId: number
    Unit: string | null;
    Reason: string | null;
    VerbalReprimand: boolean;
    SuspensionWithoutPay: boolean;
    WrittenDisciplinaryNotice: boolean;
    JobReassignmentWithSalaryReduction: boolean;
    DateFromVerbalReprimandAndSuspensionWithoutPay: string | null;
    DateToVerbalReprimandAndSuspensionWithoutPay: string | null;
    DateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: string | null;
    DateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: string | null;
    UserCodeUnionMemberResponsibility: string | null;
    UserCodeCreatedForm: string | null;
    UserNameCreatedForm: string | null;
    OrgPositionIdUserCreatedForm: number | null
}

export interface WarningLetter {
    id: number;
    applicationFormId: number | null;
    userCode: string | null;
    userName: string | null;
    departmentName: string | null;
    departmentId: number | null;
    position: string | null;
    unit: string | null;
    reason: string | null;
    verbalReprimand: boolean;
    suspensionWithoutPay: boolean;
    writtenDisciplinaryNotice: boolean;
    jobReassignmentWithSalaryReduction: boolean;
    dateFromVerbalReprimandAndSuspensionWithoutPay: string | null;
    dateToVerbalReprimandAndSuspensionWithoutPay: string | null;
    dateFromWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: string | null;
    dateToWrittenDisciplinaryNoticeAndjobReassignmentWithSalaryReduction: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    deletedAt: string | null;
    userCodeUnionMemberResponsibility: string | null;
    applicationForm: ApplicationForm
}

const warningLetterApi = {
    getAll(params: GetAll) {
        return axiosClient.get(`/warning-letter`, {params})
    },

    getByApplicationFormCode(applicationFormCode: string) {
        return axiosClient.get(`/warning-letter/${applicationFormCode}`)
    },
    
    create(data: Create) {
        return axiosClient.post(`/warning-letter`, data)
    },

    update(id: number, data: Create) {
        return axiosClient.put(`/warning-letter/${id}`, data)
    },

    delete(id: number) {
        return axiosClient.delete(`/warning-letter/${id}`)
    },

    approval(data: ApprovalRequest) {
        return axiosClient.post(`/warning-letter/approval`, data)
    },

    getMemberHrs() {
        return axiosClient.get(`/warning-letter/get-hr-members`)
    },

    assigedTask(data: IAssignedTask) {
        return axiosClient.post(`/warning-letter/assigned-task`, data)
    },

    resolvedTask(data: IResolvedTask) {
        return axiosClient.post(`/warning-letter/resolved-task`, data)
    },

    exportExcel(applicationFormCode: string) {
        return axiosClient.get(`/warning-letter/export-excel/${applicationFormCode}`, {
            responseType: 'blob'
        })
    },
}

export function useExportExcel() {
    return useMutation({
        mutationFn: async (applicationFormCode: string) => {
            const response = await warningLetterApi.exportExcel(applicationFormCode)

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

export function useResolvedTaskWarningLetter () {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await warningLetterApi.resolvedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAssignedTaskWarningLetter () {
    return useMutation({
        mutationFn: async (data: IAssignedTask) => {
            await warningLetterApi.assigedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalWarningLetter () {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await warningLetterApi.approval(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateWarningLetter () {
    return useMutation({
        mutationFn: async (data: Create) => {
            await warningLetterApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateWarningLetter() {
    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: Create}) => {
            await warningLetterApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteWarningLetter () {
    return useMutation({
        mutationFn: async (id: number) => {
            await warningLetterApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default warningLetterApi;