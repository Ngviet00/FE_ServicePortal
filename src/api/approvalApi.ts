import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';
import { useMutation } from '@tanstack/react-query';

export interface CountWaitApprovalAndAssignedInSidebar {
    DepartmentId?: number | null,
    UserCode?: string,
    OrgPositionId?: number
}

export interface ListWaitApprovalRequest {
    RequestTypeId?: number | null,
    UserCode?: string,
    OrgPositionId?: number,
    Page?: number,
    PageSize?: number,
    DepartmentId?: number | null
}

export interface ApprovalRequest {
    ApplicationFormId?: number,
    ApplicationFormCode?: string,
    RequestTypeId?: number,
    UserCodeApproval?: string,
    UserNameApproval?: string,
    OrgPositionId?: number,
    Status?: boolean,
    Note?: string,
    StatusRequest?: number,
    SelectedQuoteId?: number
}

export interface ListHistoryApprovalOrProcessedRequest {
    RequestTypeId?: number | null,
    UserCode?: string,
    Page?: number,
    PageSize?: number,
    DepartmentId?: number | null,
    Status?: number | null
}

export interface HistoryApproval {
    userNameApproval?: string,
    action: string;
    note?: string,
	createdAt: string | Date,
	requestStatusId?: number,
}

export interface IListAssigned {
    UserCode?: string,
    Page?: number,
    PageSize?: number,
    DepartmentId?: number | null,
    RequestTypeId?: number | null
}

//#region Approval All 
export interface ApprovalItem {
  ApplicationFormId: number;
  ApplicationFormCode: string;
  RequestTypeId: number;
}

export interface ApprovalAllRequest {
  Items: ApprovalItem[];
  UserCodeApproval: string;
  UserNameApproval: string;
  OrgPositionId: number;
}

export interface ApprovalAllResponse {
    code?: string,
    success?: boolean,
    error?: string
}

//#endregion

const approvalApi = {
    CountWaitApprovalAndAssignedInSidebar(params: CountWaitApprovalAndAssignedInSidebar) {
        return axiosClient.get('/approval/count-wait-approval-and-assigned-in-sidebar', {params})
    },
    GetAllApproval(params: ListWaitApprovalRequest) {
        return axiosClient.get('/approval/list-wait-approvals', {params})
    },
    Approval(data: ApprovalRequest) {
        return axiosClient.post(`/approval/approval`, data)
    },
    GetListHistoryApprovalOrProcessed(params: ListHistoryApprovalOrProcessedRequest) {
        return axiosClient.get('/approval/list-history-approval', {params})
    },
    GetListAssigned(params: IListAssigned) {
        return axiosClient.get('/approval/list-assigned', {params})
    },
    ApprovalAll(data: ApprovalAllRequest) {
        return axiosClient.post(`/approval/approval-all`, data)
    },
    GetListWaitConfirm(params: ListWaitApprovalRequest) {
        return axiosClient.get('/approval/list-wait-confirm', {params})
    },
    GetListWaitQuote(params: ListWaitApprovalRequest) {
        return axiosClient.get('/approval/list-wait-quote', {params})
    }
}

export function useApprovalAll() {
    return useMutation<ApprovalAllResponse[], Error, ApprovalAllRequest>({
        mutationFn: async (data: ApprovalAllRequest) => {
            const res = await approvalApi.ApprovalAll(data);
            return res.data.data;
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    });
}

export function useApproval() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await approvalApi.Approval(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default approvalApi;