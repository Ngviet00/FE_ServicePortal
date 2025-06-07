import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

export interface LeaveRequestData {
    id?: string | null,
    requesterUserCode: string | null,
    writeLeaveUserCode: string | null,
    name: string | null,
    department: string | null,
    position: string | null,
    fromDate: string | null,
    toDate: string | null,
    timeLeave: number | null,
    typeLeave: number | null,
    reason: string| null
    image?: string | null,
    urlFrontend: string | null,
    createdAt?: string | null,
    approvalRequest?: {
        currentPositionId: number | null,
        status: string | null
    },
    approvalAction?: {
        approverUserCode: string | null,
        approverName: string | null,
        action: string | null,
        comment: string | null,
        createdAt: string | null
    }
}

export interface HistoryLeaveRequestApproval {
    id?: string | null,
    requesterUserCode: string | null,
    name: string | null,
    department: string | null,
    position: string | null,
    fromDate: string | null,
    toDate: string | null,
    timeLeave: number | null,
    typeLeave: number | null,
    reason: string| null
    image?: string | null,
    approverName?: string | null,
    approvalAt?: string | null,
}

interface GetLeaveRequest {
    position_id?: number,
    UserCode?: string,
    Page: number;
    PageSize: number;
    Year?: number
    Status?: string
}

interface ApprovalData {
    PositionId: number | null,
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
    positionId?: number | undefined
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
    registerAllLeaveRequest(userCode: string | undefined) {
        return axiosClient.post('/leave-request/hr-register-all-leave-rq', {userCode: userCode})
    },
    getHistoryLeaveRequestApproval(params: GetLeaveRequest) {
        return axiosClient.get(`/leave-request/history-approval/`, {params})
    }
}

export function useRegisterAllLeaveRequest(userCode: string | undefined) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            await leaveRequestApi.registerAllLeaveRequest(userCode)
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

export default leaveRequestApi;