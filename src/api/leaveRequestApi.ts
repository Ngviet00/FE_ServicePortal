import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, IApplicationForm, ShowToast } from '@/lib';

export interface LeaveRequestData {
    id?: string | null,
    orgPositionId?: number,
    userCodeRequestor?: string | null,
    writeLeaveUserCode?: string | null,
    userNameWriteLeaveRequest?: string | null,
    userNameRequestor?: string | null,
    department?: string | null,
    departmentId: number,
    position?: string | null,
    fromDate?: string | null,
    toDate?: string | null,
    timeLeaveId?: number | null,
    typeLeaveId?: number | null,
    reason?: string| null
    image?: string | null,
    urlFrontend: string | null,
    createdAt?: string | null,
    createdBy?: string | null,
    typeLeave?: {
        name?: string
        nameE?: string
    },
    timeLeave?: {
        name?: string,
        nameE?: string
    },
    orgUnit?: {
        name: string
    },
    applicationForm?: IApplicationForm
}

export interface CreateLeaveRequest {
    EmailCreated?: string | undefined,
    OrgPositionId?: number | undefined,
    UserCodeCreated?: string | undefined,
    CreatedBy?: string,
    CreateLeaveRequestDto?: CreateLeaveRequestDetail,
    ImportByExcel?: FormData
}

export interface CreateLeaveRequestDetail {
    UserCode: string,
    UserName: string,
    DepartmentId: number,
    Position: string,
    FromDate: string
    ToDate: string
    TypeLeaveId: number
    TimeLeaveId: number
    Reason: string
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

interface HrRegisterAllLeave {
    UserCode: string | undefined,
    UserName: string | undefined,
    leaveRequestIds?: string[]
}

const leaveRequestApi = {

    create(formData: FormData) {
        return axiosClient.post('/leave-request', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },



    statistical(params: { year?: number}) {
        return axiosClient.get('/leave-request/statistical-leave-request', {params})
    },
    getAll(params: GetLeaveRequest) {
        return axiosClient.get('/leave-request', {params})
    },
    getById(id: string) {
        return axiosClient.get(`/leave-request/${id}`)
    },

    update(id: string, data: LeaveRequestData){
        return axiosClient.put(`/leave-request/${id}`, data)
    },
    delete(id: string) {
        return axiosClient.delete(`/leave-request/${id}`)
    },
    registerAllLeaveRequest(data: HrRegisterAllLeave) {
        return axiosClient.post('/leave-request/hr-register-all-leave-rq', data)
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

export function useCreateLeaveRequest() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await leaveRequestApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateLeaveRq() {
    return useMutation({
        mutationFn: async ({id, data} : { id: string, data: LeaveRequestData } ) => {
            await leaveRequestApi.update(id, data)
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