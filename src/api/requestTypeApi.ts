import axiosClient from './axiosClient';

interface GetAllParams {
    page: number;
    pageSize: number;
}

export interface IRequestType {
    id: number;
    name: string;
    nameE: string;
};

const requestTypeApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/request-type', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/request-type/${id}`)
    },
    create(data: {name: string}) {
        return axiosClient.post('/request-type', data)
    },
    update(id: number, data: {name: string}){
        return axiosClient.put(`/request-type/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/request-type/${id}`)
    }
}

export default requestTypeApi;