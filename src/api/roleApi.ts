import { ShowToast, getErrorMessage } from '@/lib';
import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';

interface GetAllParams {
    page: number;
    pageSize: number;
    name?: string;
}

export interface IRole {
    id: number;
    name: string;
    code: string;
};

interface SaveRoleWithOrgPositionId {
    OrgPositionId: number,
    RoleIds: number[]
}

const roleApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/role', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/role/${id}`)
    },
    create(data: {name: string}) {
        return axiosClient.post('/role', data)
    },
    update(id: number, data: {name: string}){
        return axiosClient.put(`/role/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/role/${id}`)
    },
    saveRoleWithOrgPositionId(data: SaveRoleWithOrgPositionId) {
        return axiosClient.post('/role/save-role-with-org-position-id', data)
    },
    getRoleByOrgPositionId(params: {orgPositionId: number}) {
        return axiosClient.get(`/role/get-role-by-org-position-id`, {params})
    }
}

export function useSaveOrgPositionWithRole() {
    return useMutation({
        mutationFn: async (data: SaveRoleWithOrgPositionId) => {
            await roleApi.saveRoleWithOrgPositionId(data)
        },
        onSuccess: () => {
            ShowToast('success')
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default roleApi;