import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from '../axiosClient';
import { ApprovalRequest } from '../approvalApi';
import { IResolvedTask } from '../itFormApi';

interface GetPersonalTimeKeepingRequest {
    userCode: string,
    yearMonth: string
}

interface GetManagementTimeKeepingRequest {
    UserCode?: string | null,
    YearMonth: string,
    DepartmentName?: string | null,
    Page: number,
    PageSize?: number | null
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

interface CreateRequestApprovalTimeSheet {
    orgPositionId: number;
    userName?: string;
    userCode?: string;
    yearMonth: string,
    departmentId?: string,
    departmentName?: string
}

interface DownloadTimeKeepingReportNo5 {
    fromDate: string,
    toDate: string,
    departmentName?: string
}

interface timeSheet {
    departmentName?: string,
    deptId?: string,
    yearMonth: string,
}

const timekeepingApi = {
    getPersonalTimeKeeping(params: GetPersonalTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-personal-time-keeping`, {params})
    },
    getMngTimeKeeping(params: GetManagementTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-management-time-keeping`, {params})
    },
    createRequestApprovalTimeSheet(data: CreateRequestApprovalTimeSheet) {
        return axiosClient.post(`/time-keeping/create-request-approval-timesheet`, data)
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
    getDetailTimeKeeping(applicationFormCode: string, params: { keySearch?: string, page: number, pageSize: number }) {
        return axiosClient.get(`/time-keeping/${applicationFormCode}`, {params})
    },
    resolvedTaskTimeKeeping(data: IResolvedTask) {
        return axiosClient.post(`/time-keeping/resolved-task-timekeeping`, data)
    },
    hrChooseUserMngTimeKeeping() {
        return axiosClient.get(`/time-keeping/hr-choose-user-mng-timekeeping`)
    },
    hrHandleUserOrgUnit(data: {userCode: string, orgUnitId: number, type: string}) {
        return axiosClient.post(`/time-keeping/hr-handle-user-orgunit-id`, data)
    },
    hrHandleUserMngTimeKeeping(data: {userCode: string, type: string}) {
        return axiosClient.post(`/time-keeping/hr-handle-user-mng-timeeking`, data)
    },
    downloadTimesheetReportNo5(data: DownloadTimeKeepingReportNo5) {
        return axiosClient.post('/time-keeping/export-timesheet-daily-report-no5',data, {
            responseType: 'blob'
        })
    },
    exportTimeSheet(data: timeSheet) {
        return axiosClient.post('/time-keeping/export-excel-timesheet',data, {
            responseType: 'blob'
        })
    }
}

export function useExportTimesheet() {
    return useMutation({
        mutationFn: async (data: timeSheet) => {
            const response = await timekeepingApi.exportTimeSheet(data)
            const contentDisposition = response.headers['content-disposition'] || '';
            let fileName = 'Report.xlsx';

            const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/i);
            if (match?.[1]) {
                fileName = match[1];
                fileName = decodeURIComponent(fileName);
                fileName = fileName.replace(/\s+/g, '_');
            }

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
        onSuccess: () => {
            ShowToast("Export shift successfully");        
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useExportTimeKeepingReportNo5() {
    return useMutation({
        mutationFn: async (data: DownloadTimeKeepingReportNo5) => {
            const response = await timekeepingApi.downloadTimesheetReportNo5(data)
            const contentDisposition = response.headers['content-disposition'] || '';
            let fileName = 'Report.xlsx';

            const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/i);
            if (match?.[1]) {
                fileName = match[1];
                fileName = decodeURIComponent(fileName);
                fileName = fileName.replace(/\s+/g, '_');
            }

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
        onSuccess: () => {
            ShowToast("Export shift successfully");        
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
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

export function useCreateRequestApprovalTimeSheet() {
    return useMutation({
        mutationFn: async (data: CreateRequestApprovalTimeSheet) => {
            await timekeepingApi.createRequestApprovalTimeSheet(data)
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

export default timekeepingApi;