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

const roleApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/role/get-all', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/role/${id}`)
    },
    create(data: {name: string}) {
        return axiosClient.post('/role/create', data)
    },
    update(id: number, data: {name: string}){
        return axiosClient.put(`/role/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/role/delete/${id}`)
    }
}
export default roleApi;