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

const timekeepingApi = {
    getPersonalTimeKeeping(params: GetPersonalTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-personal-time-keeping`, {params})
    },

    getMngTimeKeeping(params: GetManagementTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-management-time-keeping`, {params})
    },

    confirmTimekeepingToHr(data: GetManagementTimeKeepingRequest) {
        return axiosClient.post('/time-keeping/confirm-timekeeping-to-hr', data)
    }
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

export default timekeepingApi;