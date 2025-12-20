import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';
import { ApprovalRequest } from './approvalApi';
import { IAssignedTask, IResolvedTask } from './itFormApi';

interface ListInternalMemoRequest {
    UserCode?: string,
    Page?: number,
    PageSize?: number,
    Status?: number | null
}

interface Create {
    UserCodeCreatedForm?: string;
    UserNameCreatedForm?: string;
    OrgPositionIdUserCreatedForm?: number | null;
    DepartmentId?: number | null | undefined;
    Title?: string;
    TitleE?: string;
    TitleCode?: string;
    OtherTitle?: string;
    Save?: string;
    Note?: string;
    MetaData?: string;
}

const internalMemoHrApi = {
    create(data: Create) {
        return axiosClient.post('/internal-memo-hr', data)
    },
    list(params: ListInternalMemoRequest) {
        return axiosClient.get('/internal-memo-hr', {params})
    },
    update(applicationFormCode: string, data: Create) {
        return axiosClient.put(`/internal-memo-hr/${applicationFormCode}`, data)
    },
    delete(applicationFormId: number) {
        return axiosClient.delete(`/internal-memo-hr/${applicationFormId}`)
    },
    getDetailInternalMemoHr(applicationFormCode: string) {
        return axiosClient.get(`/internal-memo-hr/${applicationFormCode}`)
    },
    approvalInternalMemoHr(data: ApprovalRequest) {
        return axiosClient.post(`/internal-memo-hr/approval`, data)
    },
    assigedTask(data: IAssignedTask) {
        return axiosClient.post(`/internal-memo-hr/assigned-task`, data)
    },
    resolvedTask(data: IResolvedTask) {
        return axiosClient.post(`/internal-memo-hr/resolved`, data)
    },
    exportExcel(data: {applicationFormId: number}) {
        return axiosClient.post(`/internal-memo-hr/export-excel`, data, {
            responseType: 'blob'
        })
    },
}

export function useExportExcelInternalMemo() {
    return useMutation({
        mutationFn: async (data: {applicationFormId: number}) => {
            const response = await internalMemoHrApi.exportExcel(data)

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

export function useResolvedTaskInternalMemo () {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await internalMemoHrApi.resolvedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAssignedTaskInternalMemo () {
    return useMutation({
        mutationFn: async (data: IAssignedTask) => {
            await internalMemoHrApi.assigedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalInternalMemo() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await internalMemoHrApi.approvalInternalMemoHr(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateInternalMemo() {
    return useMutation({
        mutationFn: async (data: Create) => {
            await internalMemoHrApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateInternalMemo() {
    return useMutation({
        mutationFn: async ({applicationFormCode, data} : { applicationFormCode: string, data: Create } ) => {
            await internalMemoHrApi.update(applicationFormCode, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default internalMemoHrApi;