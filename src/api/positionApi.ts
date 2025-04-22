import axiosClient from './axiosClient';

interface data {
    name: string | null,
    title: string | null,
    department_id: number | null,
    level: number
}

interface GetPosition {
    page: number;
    page_size: number;
    name?: string;
}

const positionApi = {
    getAll(params: GetPosition) {
        return axiosClient.get('/position/get-all', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/position/get-by-id/${id}`)
    },
    create(data: data) {
        return axiosClient.post('/position/create', data)
    },
    update(id: number, data: data){
        return axiosClient.put(`/position/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/position/delete/${id}`)
    }
}

export default positionApi;