import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';
import { ApprovalRequest } from './approvalApi';
import { useTranslation } from 'react-i18next';

interface GetPersonalTimeKeepingRequest {
    UserCode: string,
    FromDate: string,
    ToDate: string,
}

interface GetManagementTimeKeepingRequest {
    UserCode: string,
    UserName?: string,
    Year: number,
    Month: number,
    page?: number,
    pageSize?: number,
    keySearch?: string,
    team?: number | null,
    deptId?: number | null,
    typePerson?: number | null,
    isHrMngTimeKeeping?: boolean
}

export interface WorkingDay {
    NVMaNV: string | null | undefined,
    NVHoTen: string | null | undefined,
    BPTenV: string | null | undefined,
    BCNgay: string | null | undefined,
    BCNgay1: string | null | undefined,
    Thu: string | null | undefined,
    InDau: string | null | undefined,
    OutCuoi: string | null | undefined,
    CVietTat: string | null | undefined,
    BCTGLamNgay1: string | null | undefined,
    BCTGLamToi1: string | null | undefined,
    LamThemNgay: number | null | undefined,
    LamThemToi: number | null | undefined,
    DiMuon: string | null | undefined,
    VeSom: string | null | undefined,
    RaNgoai: string | null | undefined,
    BCGhiChu: string | null | undefined,
}

export interface EditTimeAttendanceHistory {
    Datetime?: Date | string,
    UserCode?: string,
    OldValue?: string,
    CurrentValue?: string,
    UserCodeUpdate?: string,
    UpdatedBy?: string,
}
interface GetListHistoryTimeAttendanceRequest {
    UserCodeUpdated?: string,
    page?: number,
    PageSize?: number
}

export interface ListHistoryTimeAttendance {
    id?: number
    datetime?: Date | string,
    userCode?: string,
    oldValue?: string,
    currentValue?: string,
    userCodeUpdate?: string,
    updatedBy?: string,
    updatedAt?: Date | string,
    nvHoTen?: string,
    isSentToHR?: boolean
}

export interface UpdateUserMngTimeKeeping {
    userCode: string,
    orgUnitId: number[]
}

interface CreateRequestApprovalTimeKeeping {
    orgPositionId: number;
    userName?: string;
    userCode?: string;
    month: number;
    year: number;
}

const timekeepingApi = {
    getPersonalTimeKeeping(params: GetPersonalTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-personal-time-keeping`, {params})
    },

    getMngTimeKeeping(params: GetManagementTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-management-time-keeping`, {params})
    },

    UpdateUserHavePermissionMngTimeKeeping(data: string[]) {
        return axiosClient.post(`/time-keeping/update-user-have-permission-mng-timekeeping`, data)
    },
    GetUserHavePermissionMngTimeKeeping() {
        return axiosClient.get(`/time-keeping/get-user-have-permission-mng-timekeeping`)
    },

    ChangeUserMngTimeKeeping(data: { oldUserCode: string, newUserCode: string}) {
        return axiosClient.post(`/time-keeping/change-user-mng-timekeeping`, data)
    },
    AttachUserManageOrgUnit(data: {userCode: string, orgUnitIds: number[]}) {
        return axiosClient.post('/time-keeping/attach-user-manager-org-unit', data)
    },
    GetOrgUnitIdMngByUser(userCode: string) {
        return axiosClient.get(`/time-keeping/get-org-unit-id-attach-by-usercode?userCode=${userCode}`)
    },
    GetIdOrgUnitByUserCodeAndUnitId(userCode: string) {
        return axiosClient.get(`/time-keeping/get-id-org-unit-by-usercode-and-unit-id?userCode=${userCode}`)
    },
    getDeptUserMngTimeKeeping(userCode: string) {
        return axiosClient.get(`/time-keeping/get-dept-user-mng-timekeeping?userCode=${userCode}`)
    },
    EditTimeAttendanceHistory(data: EditTimeAttendanceHistory) {
        return axiosClient.post(`/time-keeping/edit-time-keeping`, data)
    },
    CountHistoryEditTimeKeepingNotSendHR(userCode: string) {
        return axiosClient.get(`/time-keeping/count-history-edit-timekeeping-not-send-hr?userCode=${userCode}`)
    },
    GetListHistoryEditTimeKeeping(params: GetListHistoryTimeAttendanceRequest) {
        return axiosClient.get(`/time-keeping/get-list-history-edit-timekeeping`, {params})
    },
    DeleteHistoryEditTimeKeeping(id: number) {
        return axiosClient.delete(`/time-keeping/delete-history-edit-timekeeping/${id}`)
    },
    createRequestApprovalTimeKeeping(data: CreateRequestApprovalTimeKeeping) {
        return axiosClient.post(`/time-keeping/create-request-approval-timekeeping`, data)
    },
    approval(data: ApprovalRequest) {
        return axiosClient.post(`/time-keeping/approval`, data)
    },
    deleteTimeKeeping(applicationFormCode: string) {
        return axiosClient.delete(`/time-keeping/${applicationFormCode}`)
    },
    getListTimeKeeping(params: { UserCode?: string, Status?: number | null, Page: number, PageSize: number}) {
        return axiosClient.get(`/time-keeping/get-list-timekeeping`, {params})
    },
    getDetailTimeKeeping(applicationFormCode: string, params: { TypePerson?: string, KeySearch?: string, Page: number, PageSize: number }) {
        return axiosClient.get(`/time-keeping/${applicationFormCode}`, {params})
    },
    exportExcelTimeKeeping(applicationFormCode: string) {
        return axiosClient.post(`/time-keeping/export-excel?applicationFormCode=${applicationFormCode}`)
    }
}

export function useExportExcelTimeKeeping() {
    const lang = useTranslation().i18n.language.split('-')[0]
    
    return useMutation({
        mutationFn: async (applicationFormCode: string) => {
            await timekeepingApi.exportExcelTimeKeeping(applicationFormCode)
        },
        onSuccess: () => {
            ShowToast(lang == 'vi' ? 'Sau khi xuất excel thành công thì sẽ gửi qua email' : 'After successfully exporting Excel, it will be sent via email')
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteTimeKeeping() {
    return useMutation({
        mutationFn: async (applicationFormCode: string) => {
            await timekeepingApi.deleteTimeKeeping(applicationFormCode)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useCreateRequestTimeKeeping() {
    return useMutation({
        mutationFn: async (data: CreateRequestApprovalTimeKeeping) => {
            await timekeepingApi.createRequestApprovalTimeKeeping(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useApprovalTimeKeeping() {
    return useMutation({
        mutationFn: async (data: ApprovalRequest) => {
            await timekeepingApi.approval(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteHistoryEditTimeKeeping() {
    return useMutation({
        mutationFn: async (id: number) => {
            await timekeepingApi.DeleteHistoryEditTimeKeeping(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useEditTimeAttendanceHistory() {
    return useMutation({
        mutationFn: async (data: EditTimeAttendanceHistory) => {
            await timekeepingApi.EditTimeAttendanceHistory(data)
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
            await timekeepingApi.AttachUserManageOrgUnit(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateUserPermissionMngTimeKeeping() {
    return useMutation({
        mutationFn: async (data: string[]) => {
            await timekeepingApi.UpdateUserHavePermissionMngTimeKeeping(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useChangeUserMngTimekeeping() {
    return useMutation({
        mutationFn: async (data: { oldUserCode: string, newUserCode: string}) => {
            await timekeepingApi.ChangeUserMngTimeKeeping(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default timekeepingApi;