import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';
import { useMutation } from '@tanstack/react-query';

export interface CountWaitApprovalAndAssignedInSidebar {
    UserCode?: string,
    OrgUnitId?: number
}

export interface ListWaitApprovalRequest {
    RequestTypeId?: number | null,
    UserCode?: string,
    OrgUnitId?: number,
    Page?: number,
    PageSize?: number,
    DepartmentId?: number | null
}

interface ApprovalRequest {
    RequestTypeId?: number,
    UserCodeApproval?: string,
    UserNameApproval?: string,
    OrgUnitId?: number,
    MemoNotificationId?: string,
    LeaveRequestId?: string,
    Status?: boolean,
    Note?: string,
    urlFrontend?: string
}
export interface ListHistoryApprovalOrProcessedRequest {
    RequestTypeId?: number | null,
    UserCode?: string,
    Page?: number,
    PageSize?: number,
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
        return axiosClient.get('/approval/list-history-approval-or-processed', {params})
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