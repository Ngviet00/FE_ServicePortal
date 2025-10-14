import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, IApplicationForm, ShowToast } from '@/lib';
import { OrgUnit } from './orgUnitApi';
import { IAssignedTask, IResolvedTask } from './itFormApi';
import { ApprovalRequest, ListWaitApprovalRequest } from './approvalApi';

interface GetAll {
    UserCode?: string,
    Page: number
    PageSize: number,
    DepartmentId?: number | null,
    RequestStatusId?: number | null,
    Year?: number | null,
}

export interface IPurchase {
    id?: string;
    applicationFormId?: string;
    code?: string;
    userCode?: string;
    userName?: string;
    departmentId?: number;
    requestedDate?: string | Date;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    deletedAt?: string | Date;
    applicationForm?: IApplicationForm;
    purchaseDetails?: IPurchaseDetail[];
    orgUnit?: OrgUnit;
};

export interface ICreatePurchase {
    UserCode?: string,
    UserName?: string,
    DepartmentId?: number,
    OrgPositionId?: number,
    RequestedDate?: string | Date,
    UrlFrontend: string,
    ApplicationFormCodeReference?: string | null,
    CreatePurchaseDetailRequests?: IPurchaseDetail[],
}

export interface IUpdatePurchase {
    RequestedDate?: string | Date,
    CreatePurchaseDetailRequests?: IPurchaseDetail[],
}

export interface IPurchaseDetail {
    Id?: string
    PurchaseId?: string
    ItemName?: string
    ItemDescription?: string
    Quantity?: number
    UnitMeasurement?: string
    RequiredDate?: string
    CostCenterId?: number
    Note?: string
    CreatedAt?: string
    UpdatedAt?: string
    DeletedAt?: string
}

export interface IStatisticalPurchase {
    year?: number
}

export interface RequestForQuote {
    UserCode?: string,
    UserName?: string
    UserCodeQuote?: string
    UserNameQuote?: string
    ApplicationFormId?: number,
    Note?: string
}

export interface ResponseForQuote {
    UserCode?: string,
    UserName?: string
    ApplicationFormId?: number,
    Note?: string
}


const purchaseApi = {
    statistical(params: IStatisticalPurchase) {
        return axiosClient.get('/purchase/statistical-purchase', {params})
    },
    getAll(params: GetAll) {
        return axiosClient.get('/purchase', {params})
    },
    getById(applicationFormCode: string) {
        return axiosClient.get(`/purchase/${applicationFormCode}`)
    },
    create(data: ICreatePurchase) {
        return axiosClient.post('/purchase', data)
    },
    update(applicationFormCode: string, data: IUpdatePurchase){
        return axiosClient.put(`/purchase/${applicationFormCode}`, data)
    },
    delete(applicationFormCode: string) {
        return axiosClient.delete(`/purchase/${applicationFormCode}`)
    },
    assignedTask(data: IAssignedTask) {
        return axiosClient.post('/purchase/assigned-task', data)
    },
    resolvedTask(data: IResolvedTask) {
        return axiosClient.post('/purchase/resolved-task', data)
    },
    getMemberPurchaseAssigned() {
        return axiosClient.get('/purchase/get-member-purchase-assigned')
    },
    approval(data: ApprovalRequest) {
        return axiosClient.post(`/purchase/approval`, data)
    },
    requestForQuote(data: RequestForQuote) {
        return axiosClient.post('/purchase/request-for-quote', data)
    },
    responseForQuote(data: ResponseForQuote) {
        return axiosClient.post('/purchase/response-for-quote', data)
    },
    getListWaitResponseQuote(params: ListWaitApprovalRequest) {
        return axiosClient.get('/purchase/list-wait-response-quote', {params})
    },
    updatePOAndStatus(applicationFormCode: string, data: { userName: string, userCode: string, purchaseOrder: string; statusId: number }) {
        return axiosClient.put(`/purchase/update-po-and-status/${applicationFormCode}`, data)
    }
}

export function useRequestForQuote() {
    return useMutation({
        mutationFn: async (data: RequestForQuote) => {
            await purchaseApi.requestForQuote(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useResponseForQuote() {
    return useMutation({
        mutationFn: async (data: ResponseForQuote) => {
            await purchaseApi.responseForQuote(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalPurchase() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await purchaseApi.approval(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreatePurchase() {
    return useMutation({
        mutationFn: async (data: ICreatePurchase) => {
            await purchaseApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdatePurchase() {
    return useMutation({
        mutationFn: async ({id, data} : {id: string, data: IUpdatePurchase}) => {
            await purchaseApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeletePurchase() {
    return useMutation({
        mutationFn: async (id: string) => {
            await purchaseApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAssignedTaskPurchaseForm() {
    return useMutation({
        mutationFn: async (data: IAssignedTask) => {
            await purchaseApi.assignedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useResolvedTaskPurchaseForm() {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await purchaseApi.resolvedTask(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default purchaseApi;