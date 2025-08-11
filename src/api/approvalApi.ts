import axiosClient from './axiosClient';

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
    DepartmentName?: string
}

const approvalApi = {
    CountWaitApprovalAndAssignedInSidebar(params: CountWaitApprovalAndAssignedInSidebar) {
        return axiosClient.get('/approval/count-wait-approval-and-assigned-in-sidebar', {params})
    },
    GetAllApproval(params: ListWaitApprovalRequest) {
        return axiosClient.get('/approval/list-wait-approvals', {params})
    }
}

export default approvalApi;