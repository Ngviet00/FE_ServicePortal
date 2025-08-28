import axiosClient from './axiosClient';

interface GetAllParams {
    page: number;
    pageSize: number;
    name?: string;
}

export interface ICostCenter {
    id: number;
    code: string;
    description: string;
};

const costCenterApi = {
    getAll(params?: GetAllParams) {
        return axiosClient.get('/cost-center', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/cost-center/${id}`)
    },
    create(data: {name: string}) {
        return axiosClient.post('/cost-center', data)
    },
    update(id: number, data: {name: string}){
        return axiosClient.put(`/cost-center/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/cost-center/${id}`)
    }
}

export default costCenterApi;