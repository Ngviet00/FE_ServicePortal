import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import axiosClient from './axiosClient';

interface GetPersonalTimeKeepingRequest {
    UserCode: string,
    FromDate: string,
    ToDate: string,
}

interface GetManagementTimeKeepingRequest {
    UserCode: string,
    Year: number,
    Month: number,
    page?: number,
    pageSize?: number,
    StatusColors?: Record<string, string | null>,
    StatusDefine?: Record<string, string | null>,
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

export interface UpdateUserMngTimeKeeping {
    userCode: string,
    orgUnitId: number[]
}

const timekeepingApi = {
    getPersonalTimeKeeping(params: GetPersonalTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-personal-time-keeping`, {params})
    },

    getMngTimeKeeping(params: GetManagementTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-management-time-keeping`, {params})
    },

    confirmTimekeepingToHr(data: GetManagementTimeKeepingRequest) {
        return axiosClient.post('/time-keeping/confirm-timekeeping-to-hr', data)
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
    GetOrgUnitIdAttachedByUserCode(userCode: string) {
        return axiosClient.get(`/time-keeping/get-org-unit-id-attach-by-usercode?userCode=${userCode}`)
    }
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

export function useConfirmTimeKeeping() {
    return useMutation({
        mutationFn: async (data: GetManagementTimeKeepingRequest) => {
            await timekeepingApi.confirmTimekeepingToHr(data)
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