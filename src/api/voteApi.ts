import { useMutation, useQuery } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

export interface GetAllVote {
    Page: number;
    PageSize: number;
    SearchTitle?: string
    StatusId?: number,
    RoleCode?: string,
    UserCode?: string,
    DepartmentId?: number | null
}

export interface IRole {
    id: number;
    name: string;
    code: string;
};

interface VoteRequest {
    VoteId: number,
    VoteOptionId: number,
    UserCode: string,
    DepartmentId?: number | null
}

interface GetListUserNotVoteByDepartmentId {
    Page: number,
    PageSize: number;
    VoteId: number
    DepartmentId: number
}

const voteApi = {
    getAll(params: GetAllVote ) {
        return axiosClient.get('/vote', {params})
    },
    getById(id?: number) {
        return axiosClient.get(`/vote/${id}`)
    },
    GetDetailVoteById(id: number) {
        return axiosClient.get(`/vote/detail-vote/${id}`)
    },
    GetFileAsync(id: number) {
        return axiosClient.get(`/vote/get-file/${id}`)
    },
    create(data: FormData) {
        return axiosClient.post('/vote', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    update(id: number, data: FormData){
        return axiosClient.put(`/vote/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    delete(id: number) {
        return axiosClient.delete(`/vote/${id}`)
    },
    vote(data: VoteRequest) {
        return axiosClient.post('/vote/vote', data)
    },
    getListUserNotVoteByDepartmentId(params: GetListUserNotVoteByDepartmentId) {
        return axiosClient.get(`/vote/get-list-user-not-vote-by-department-id`, {params})
    },
    exportExcel(voteId: number) {
        return axiosClient.post('/vote/export-excel-voted', voteId, {
            responseType: 'blob'
        })
    },
}

export function useExportExcelUserHaveVoted() {
    return useMutation({
        mutationFn: async (voteId: number) => {
            const response = await voteApi.exportExcel(voteId)

            const d = new Date();
            const f = (n: number, l: number) => n.toString().padStart(l, '0');
            const name = `List_voted_${d.getFullYear()}_${f(d.getMonth()+1,2)}_${f(d.getDate(),2)}_${f(d.getHours(),2)}_${f(d.getMinutes(),2)}_${f(d.getSeconds(),2)}.xlsx`;

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

export function useGetVoteById(id?: number) {
    return useQuery({
            queryKey: ['get-vote-by-id', id],
            queryFn: async () => {
            const { data } = await voteApi.getById(id)
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateVote() {
    return useMutation({
        mutationFn: async (data: FormData) => {
            await voteApi.create(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useUpdateVote() {
    return useMutation({
        mutationFn: async ({id, data}: {id: number, data: FormData}) => {
            await voteApi.update(id, data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useDeleteVote() {
    return useMutation({
        mutationFn: async (id: number) => {
            await voteApi.delete(id)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useVote() {
    return useMutation({
        mutationFn: async (data: VoteRequest) => {
            await voteApi.vote(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default voteApi;