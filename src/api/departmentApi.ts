import axiosClient from './axiosClient';

interface data {
    name: string;
    note?: string;
    parentId: number;
}

interface GetDeparment {
    page: number;
    page_size: number;
    name?: string;
}

const deparmentApi = {
    getAll(params: GetDeparment) {
        return axiosClient.get('/deparment/get-all', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/deparment/${id}`)
    },
    create(data: data) {
        return axiosClient.post('/deparment/create', data)
    },
    update(id: number, data: data){
        return axiosClient.put(`/deparment/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/deparment/delete/${id}`)
    }
}

export default deparmentApi;