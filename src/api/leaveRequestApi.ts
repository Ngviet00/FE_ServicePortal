import axiosClient from './axiosClient';

export interface LeaveRequestData {
    id?: string | null,
    user_code: string,
    name: string | null,
    user_code_register: string,
    name_register: string | null,
    position: string | null,
    department: string | null,
    from_date: string | null,
    to_date: string | null,
    reason: string| null
    time_leave: number | null,
    type_leave: number | null,
    status?: number | null,
    image?: string | null,
    note?: string | null,
    approved_by?: string | null,
    created_at?: string | null,
    updated_at?: string | null,
    deleted_at?: string | null,
    url_front_end?: string | null
}

interface GetLeaveRequest {
    position_id?: number,
    user_code?: string,
    page: number;
    page_size: number;
    year?: number
    status?: number
}

interface ApprovalData {
    user_code_approval: string, 
    leave_request_id: string,
    status: boolean,
    note: string | null,
    url_front_end?: string
}

interface GetWaitApproval {
    page?: number,
    page_size?: number,
    level?: string | undefined,
    department_id?: number | undefined
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
    }
}

export default leaveRequestApi;