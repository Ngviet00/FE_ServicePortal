import axiosClient from './axiosClient';

export interface LeaveRequestData {
    id?: string | null,
    user_code: string,
    name: string | null,
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
    created_at?: string | null,
    updated_at?: string | null,
    deleted_at?: string | null,
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
    status: boolean
}

const leaveRequestApi = {
    getAll(params: GetLeaveRequest) {
        return axiosClient.get('/leave-request/get-all', {params})
    },
    getLeaveRequestWaitApproval(params: GetLeaveRequest) {
        return axiosClient.get('/leave-request/get-leave-request-wait-approval', {params})
    },
    approvalLeaveRequest(data: ApprovalData) {
        return axiosClient.post('/leave-request/approval', data)
    },
    getById(id: number) {
        return axiosClient.get(`/leave-request/get-by-id/${id}`)
    },
    create(data: LeaveRequestData) {
        return axiosClient.post('/leave-request/create', data)
    },
    update(id: number, data: LeaveRequestData){
        return axiosClient.put(`/leave-request/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/leave-request/delete/${id}`)
    }
}

export default leaveRequestApi;