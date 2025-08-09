import axiosClient from './axiosClient';

export interface CountWaitApprovalAndAssignedInSidebar {
    UserCode?: string,
    OrgUnitId?: number
}

const approvalApi = {
    CountWaitApprovalAndAssignedInSidebar(params: CountWaitApprovalAndAssignedInSidebar) {
        return axiosClient.get('/approval/count-wait-approval-and-assigned-in-sidebar', {params})
    }
}

export default approvalApi;