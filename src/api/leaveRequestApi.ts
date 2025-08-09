import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

export interface LeaveRequestData {
    id?: string | null,
    requesterUserCode?: string | null,
    writeLeaveUserCode?: string | null,
    userNameWriteLeaveRequest?: string | null,
    name?: string | null,
    department?: string | null,
    position?: string | null,
    fromDate?: string | null,
    toDate?: string | null,
    timeLeaveId?: number | null,
    typeLeaveId?: number | null,
    reason?: string| null
    image?: string | null,
    urlFrontend: string | null,
    createdAt?: string | null,
    typeLeave?: {
        name?: string
        nameV?: string
    },
    timeLeave?: {
        description?: string,
        english?: string
    }
    applicationForm?: {
        currentPositionId: number | null,
        status: string | null,
        createdAt: string | null
    },
    historyApplicationForm?: {
        userApproval?: string | null,
        actionType?: string | null,
        comment?: string | null
        createdAt: string | null
    }
}

export interface CreateLeaveRequestForManyPeople {
    Leaves: LeaveRequestData[]
}

export interface HistoryLeaveRequestApproval {
    id?: string | null,
    requesterUserCode: string | null,
    name: string | null,
    department: string | null,
    position: string | null,
    fromDate: string | null,
    toDate: string | null,
    reason: string| null
    image?: string | null,
    approverName?: string | null,
    approvalAt?: string | null,
    typeLeave?: {
        name?: string,
        nameV?: string,
    },
    timeLeave?: {
        description?: string,
        english?: string,
    }
    applicationForm?: {
        currentPositionId: number | null,
        status: string | null,
        createdAt: string | null
    },
    historyApplicationForm?: {
        userApproval?: string | null,
        actionType?: string | null,
        comment?: string | null
        createdAt: string | null
    }
}

interface GetLeaveRequest {
    position_id?: number,
    UserCode?: string,
    Page: number;
    PageSize: number;
    Year?: number
    Status?: number
    Keysearch?: string,
    Date?: string
}

interface ApprovalData {
    NameUserApproval: string | null,
    UserCodeApproval: string | null,
    LeaveRequestId: string,
    Status: boolean,
    Note: string | null,
    UrlFrontEnd: string | null
}

interface GetWaitApproval {
    page?: number,
    pageSize?: number,
    UserCode?: string, 
    OrgUnitId?: number | undefined,
    selectedDepartment?: string,
}

interface HrRegisterAllLeave {
    UserCode: string | undefined,
    UserName: string | undefined,
    leaveRequestIds?: string[]
}

const leaveRequestApi = {
    getAll(params: GetLeaveRequest) {
        return axiosClient.get('/leave-request/get-all', {params})
    },
    getLeaveRequestWaitApproval(params: GetWaitApproval) {
        return axiosClient.get('/leave-request/get-leave-request-wait-approval', {params})
    },
    countWaitApprovalLeaveRequest(params: GetWaitApproval) {
        return axiosClient.get('/leave-request/count-wait-approval', {params})
    },
    approvalLeaveRequest(data: ApprovalData) {
        return axiosClient.post('/leave-request/approval', data)
    },
    getById(id: string) {
        return axiosClient.get(`/leave-request/get-by-id/${id}`)
    },
    create(data: LeaveRequestData) {
        return axiosClient.post('/leave-request/create', data)
    },
    update(id: string, data: LeaveRequestData){
        return axiosClient.put(`/leave-request/update/${id}`, data)
    },
    delete(id: string) {
        return axiosClient.delete(`/leave-request/delete/${id}`)
    },
    registerAllLeaveRequest(data: HrRegisterAllLeave) {
        return axiosClient.post('/leave-request/hr-register-all-leave-rq', data)
    },
    getHistoryLeaveRequestApproval(params: GetLeaveRequest) {
        return axiosClient.get(`/leave-request/history-approval/`, {params})
    },
    createLeaveRequestForOther(data: CreateLeaveRequestForManyPeople) {
        return axiosClient.post('/leave-request/create-leave-for-others', data)
    },
    GetUserCodeHavePermissionCreateMultipleLeaveRequest() {
        return axiosClient.get('/leave-request/get-usercode-have-permission-create-multiple-leave-request')
    },
    UpdateUserHavePermissionCreateMultipleLeaveRequest(data: string[]) {
        return axiosClient.post('/leave-request/update-user-have-permission-create-multiple-leave-request', data)
    },
    SearchUserRegisterLeaveRequest(params: { userCodeRegister: string, usercode: string }) {
        return axiosClient.get('/leave-request/search-user-register-leave-request', {params})
    },
    AttachUserManageOrgUnit(data: {userCode: string, orgUnitIds: number[]}) {
        return axiosClient.post('/leave-request/attach-user-manager-org-unit', data)
    },
    GetOrgUnitIdAttachedByUserCode(userCode: string) {
        return axiosClient.get(`/leave-request/get-org-unit-id-attach-by-usercode?userCode=${userCode}`)
    },
    GetHrWithManagementLeavePermission() {
        return axiosClient.get(`/leave-request/get-user-have-permission-hr-mng-leave-request`)
    },
    UpdateHrWithManagementLeavePermission(data: string[]) {
        return axiosClient.post(`/leave-request/update-user-have-permission-hr-mng-leave-request`, data)
    },
    HrExportExcelLeaveRequest(data: string[]) {
        return axiosClient.post('/leave-request/hr-export-excel-leave-request', data, {
            responseType: 'blob'
        })
    }
}

export function useHrExportExcelLeaveRequest() {
    return useMutation({
        mutationFn: async (data: string[]) => {
            const response = await leaveRequestApi.HrExportExcelLeaveRequest(data)

            const d = new Date();
            const f = (n: number, l: number) => n.toString().padStart(l, '0');
            const name = `LeaveRequests_${d.getFullYear()}_${f(d.getMonth()+1,2)}_${f(d.getDate(),2)}_${f(d.getHours(),2)}_${f(d.getMinutes(),2)}_${f(d.getSeconds(),2)}.xlsx`;

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name);
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

export function useUpdateHrWithManagementLeavePermission() {
    return useMutation({
        mutationFn: async (data: string[]) => {
            await leaveRequestApi.UpdateHrWithManagementLeavePermission(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAttachUserManageOrgUnit() {
    return useMutation({
        mutationFn: async (data: {userCode: string, orgUnitIds: number[]}) => {
            await leaveRequestApi.AttachUserManageOrgUnit(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateUserHavePermissionCreateMultipleLeaveRequest() {
    return useMutation({
        mutationFn: async (data: string[]) => {
            await leaveRequestApi.UpdateUserHavePermissionCreateMultipleLeaveRequest(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useRegisterAllLeaveRequest() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: HrRegisterAllLeave) => {
            await leaveRequestApi.registerAllLeaveRequest(data)
        },
        onSuccess: () => {
            ShowToast("Success");
            queryClient.invalidateQueries({
                queryKey: ['get-leave-request-wait-approval'],
            });
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateLeaveRequestForManyPeople() {
    return useMutation({
        mutationFn: async (data: CreateLeaveRequestForManyPeople) => {
            await leaveRequestApi.createLeaveRequestForOther(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default leaveRequestApi;