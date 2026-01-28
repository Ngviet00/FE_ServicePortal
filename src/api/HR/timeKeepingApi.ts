import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from '../axiosClient';
import { ApprovalRequest } from '../approvalApi';
import { useTranslation } from 'react-i18next';
import { IResolvedTask } from '../itFormApi';

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
    ThuE: string | null | undefined,
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
    UserName?: string,
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
    userName?: string,
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
    deleteTimeKeeping(applicationFormId: number) {
        return axiosClient.delete(`/time-keeping/${applicationFormId}`)
    },
    getListTimeKeeping(params: { UserCode?: string, Status?: number | null, Page: number, PageSize: number}) {
        return axiosClient.get(`/time-keeping/get-list-timekeeping`, {params})
    },
    getDetailTimeKeeping(applicationFormCode: string, params: { TypePerson?: string, KeySearch?: string, Page: number, PageSize: number }) {
        return axiosClient.get(`/time-keeping/${applicationFormCode}`, {params})
    },
    exportExcelTimeKeeping(applicationFormCode: string) {
        return axiosClient.post(`/time-keeping/export-excel?applicationFormCode=${applicationFormCode}`)
    },
    resolvedTaskTimeKeeping(data: IResolvedTask) {
        return axiosClient.post(`/time-keeping/resolved-task-timekeeping`, data)
    },
    hrMngTimeKeeping() {
        return axiosClient.get(`/time-keeping/hr-mng-timekeeping`)
    },
    hrHandleUserOrgUnit(data: {userCode: string, orgUnitId: number, type: string}) {
        return axiosClient.post(`/time-keeping/hr-handle-user-orgunit-id`, data)
    },
    hrHandleUserMngTimeKeeping(data: {userCode: string, type: string}) {
        return axiosClient.post(`/time-keeping/hr-handle-user-mng-timeeking`, data)
    }
}

export function useHRHandleUserOrgUnit () {
    return useMutation({
        mutationFn: async (data: {userCode: string, orgUnitId: number, type: string}) => {
            await timekeepingApi.hrHandleUserOrgUnit(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useHRHandleUserMngTimeKeeping () {
    return useMutation({
        mutationFn: async (data: {userCode: string, type: string}) => {
            await timekeepingApi.hrHandleUserMngTimeKeeping(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useResolvedTaskTimeKeeping () {
    return useMutation({
        mutationFn: async (data: IResolvedTask) => {
            await timekeepingApi.resolvedTaskTimeKeeping(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
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
        mutationFn: async (applicationFormId: number) => {
            await timekeepingApi.deleteTimeKeeping(applicationFormId)
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

export default timekeepingApi;