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
    },
    getById(id: number) {
        return axiosClient.get(`/permission/${id}`)
    },
    create(data: {name: string}) {
        return axiosClient.post('/permission/create', data)
    },
    update(id: number, data: {name: string}){
        return axiosClient.put(`/permission/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/permission/delete/${id}`)
    }
}
export default permissionApi;