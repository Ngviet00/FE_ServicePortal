import axiosClient from './axiosClient';

interface GetAllParams {
    page: number;
    pageSize: number;
    name?: string;
}

export interface IPermission {
    id: number;
    name: string;
    group: string;
};

const permissionApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/permission', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/permission/${id}`)
    },
    create(data: {name: string}) {
        return axiosClient.post('/permission', data)
    },
    update(id: number, data: {name: string}){
        return axiosClient.put(`/permission/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/permission/${id}`)
    }
}
export default permissionApi;