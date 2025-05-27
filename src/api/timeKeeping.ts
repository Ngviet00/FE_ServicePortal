import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

interface GetPersonalTimeKeepingRequest {
    UserCode: string,
    FromDate: string,
    ToDate: string,
}

interface GetManagementTimeKeepingRequest {
    UserCode: string,
    Year: number,
    Month: number,
}

interface GetListUserToChooseManageTimeKeepingRequest {
    Position: number | undefined,
    UserCode: string,
    Name?: string | null,
    Page: number | 1,
    PageSize: number | 10
}

interface SaveManageTimeKeeping {
    UserCodeManage: string | null,
    UserCodes: string[]
}

export interface DataTimeKeeping {
    date: string,
    day: string,
    from: string,
    to: string,
}

const timekeepingApi = {
    getPersonalTimeKeeping(params: GetPersonalTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-personal-time-keeping`, {params})
    },

    getMngTimeKeeping(params: GetManagementTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-management-time-keeping`, {params})
    },

    sendTimeKeepingToHR(data: GetManagementTimeKeepingRequest) {
        return axiosClient.post('/time-keeping/confirm-time-keeping-to-hr', data)
    },

    GetListUserToChooseManage(params: GetListUserToChooseManageTimeKeepingRequest) {
        return axiosClient.get(`/time-keeping/get-list-user-to-choose-manage-time-keeping`, {params})
    },

    SaveManageTimeKeeping(data: SaveManageTimeKeeping) {
        return axiosClient.post('/time-keeping/save-manage-time-keeping', data)
    }
}

export function useConfirmTimeKeeping() {
    return useMutation({
        mutationFn: async (data: GetManagementTimeKeepingRequest) => {
            await timekeepingApi.sendTimeKeepingToHR(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useSaveManageTimeKeeping() {
    return useMutation({
        mutationFn: async (data: SaveManageTimeKeeping) => {
            await timekeepingApi.SaveManageTimeKeeping(data)
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