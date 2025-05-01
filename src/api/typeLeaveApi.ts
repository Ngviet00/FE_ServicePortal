import axiosClient from './axiosClient';

interface GetAllParams {
    page: number;
    page_size: number;
    name?: string;
}

const typeLeaveApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/type-leave/get-all', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/type-leave/${id}`)
    },
    create(data: {name: string}) {
        return axiosClient.post('/type-leave/create', data)
    },
    update(id: number, data: {name: string}){
        return axiosClient.put(`/type-leave/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/type-leave/delete/${id}`)
    }
}
export default typeLeaveApi;