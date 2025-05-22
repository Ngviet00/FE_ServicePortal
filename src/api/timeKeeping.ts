import { useQuery } from '@tanstack/react-query';
import axiosClient from './axiosClient';

interface GetPersonalTimeKeepingRequest {
    UserCode: string,
    FromDate: string,
    ToDate: string,
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

    getMngTimeKeeping(userCode: string) {
        return axiosClient.get(`/time-keeping/get-mng-time-keeping/${userCode}`)
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

export function useGetMngTimeKeeping () {
    
}

export default timekeepingApi;