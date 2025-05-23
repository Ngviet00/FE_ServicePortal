import { useMutation, useQuery } from '@tanstack/react-query';
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
    }
}

export function useGetPersonalTimeKeeping (params: GetPersonalTimeKeepingRequest) {
    const { UserCode, FromDate, ToDate } = params;
    return useQuery({
        queryKey: ['personal-timekeeping', UserCode, FromDate, ToDate],
        queryFn: async () => {
            const res = await timekeepingApi.getPersonalTimeKeeping(params);
            return res.data.data;
        }
    });
}

export function useGetMngTimeKeeping (params: GetManagementTimeKeepingRequest) {
    const { UserCode, Year, Month } = params;
    return useQuery({
        queryKey: ['management-timekeeping', UserCode, Year, Month],
        queryFn: async () => {
            const res = await timekeepingApi.getMngTimeKeeping(params);
            return res.data.data;
        }
    });
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

export default timekeepingApi;