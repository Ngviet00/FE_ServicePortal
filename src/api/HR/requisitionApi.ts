import { ShowToast, getErrorMessage } from '@/lib';
import { useMutation } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
import { ApprovalRequest } from '../approvalApi';
import { ApplicationForm, IAssignedTask, IResolvedTask } from '../itFormApi';

interface GetAll {
    UserCode?: string,
    Page: number,
    PageSize: number,
}

interface Create {
    OrgPositionIdUserCreatedForm: number | null;
    UserCodeCreatedForm?: string | null;
    UserNameCreatedForm?: string | null;
    DepartmentNameRequest?: string | null;
    PositionAdditional?: string | null;
    AddititionalPeople?: number | null;
    DateRequired?: string | null;
    Reason?: string | null;
    GetMarriage?: string | null;
    Education?: string | null;
    Expertise: boolean;
    Language: boolean;
    English?: string | null;
    Japanese?: string | null;
    Experience?: string | null;
    Personality?: string | null;
    Skills?: string | null;
    DescriptionJob?: string | null;
}

export interface RequisitionLetter {
    id: number;
    applicationFormId?: number | null;
    departmentNameRequest?: string | null; 
    positionAdditional?: string | null; 
    addititionalPeople: number; 
    dateRequired?: Date | null; 
    reason?: string | null; 
    getMarriage?: string | null; 
    education?: string | null; 
    expertise: boolean; 
    language: boolean; 
    english?: string | null; 
    japanese?: string | null; 
    experience?: string | null; 
    personality?: string | null; 
    skills?: string | null; 
    descriptionJob?: string | null; 
    createdAt?: Date | null; 
    updatedAt?: Date | null; 
    deletedAt?: Date | null; 
    applicationForm?: ApplicationForm | null; 
}

const requisitionLetterApi = {
    getAll(params: GetAll) {
        return axiosClient.get(`/requisition-letter`, {params})
    },

    getByApplicationFormCode(applicationFormCode: string) {
        return axiosClient.get(`/requisition-letter/${applicationFormCode}`)
    },
    
    create(data: Create) {
        return axiosClient.post(`/requisition-letter`, data)
    },

    update(id: number, data: Create) {
        return axiosClient.put(`/requisition-letter/${id}`, data)
    },

    delete(id: number) {
        return axiosClient.delete(`/requisition-letter/${id}`)
    },

    approval(data: ApprovalRequest) {
        return axiosClient.post(`/requisition-letter/approval`, data)
    },

    assigedTask(data: IAssignedTask) {
        return axiosClient.post(`/requisition-letter/assigned-task`, data)
    },

    resolvedTask(data: IResolvedTask) {
        return axiosClient.post(`/requisition-letter/resolved-task`, data)
    },

    exportExcel(applicationFormCode: string) {
        return axiosClient.get(`/requisition-letter/export-excel/${applicationFormCode}`, {
            responseType: 'blob'
        })
    },
}

export function useExportExcelRequisition() {
    return useMutation({
        mutationFn: async (applicationFormCode: string) => {
            const response = await requisitionLetterApi.exportExcel(applicationFormCode)

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

export function useResolvedTaskRequisitionLetter () {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await requisitionLetterApi.resolvedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAssignedTaskRequisitionLetter () {
    return useMutation({
        mutationFn: async (data: IAssignedTask) => {
            await requisitionLetterApi.assigedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalRequisitionLetter () {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await requisitionLetterApi.approval(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateRequisitionLetter () {
    return useMutation({
        mutationFn: async (data: Create) => {
            await requisitionLetterApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateRequisitionLetter() {
    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: Create}) => {
            await requisitionLetterApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteRequisitionLetter () {
    return useMutation({
        mutationFn: async (id: number) => {
            await requisitionLetterApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default requisitionLetterApi;