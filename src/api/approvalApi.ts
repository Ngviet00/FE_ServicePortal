import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';
import { useMutation } from '@tanstack/react-query';

export interface CountWaitApprovalAndAssignedInSidebar {
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
    }
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