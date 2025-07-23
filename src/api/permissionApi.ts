import axiosClient from './axiosClient';

interface GetAllParams {
    page: number;
    pageSize: number;
    name?: string;
}

export interface IPermission {
    id: number;
    name: string;
    description: string;
};

const permissionApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/permission/get-all', {params})
    }
}
export default permissionApi;