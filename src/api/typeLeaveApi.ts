import axiosClient from './axiosClient';

interface GetAllParams {
    page?: number;
    page_size?: number;
    name?: string;
}

interface Data {
    name: string,
    modified_by: string | null | undefined
}

export interface ITypeLeave {
    id: number;
    name: string;
    nameV: string,
    modifiedBy: string,
    modifiedAt: string,
};

const typeLeaveApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/type-leave/get-all', {params})
    },

    getById(id: number) {
        return axiosClient.get(`/type-leave/${id}`)
    },

    create(data: Data) {
        return axiosClient.post('/type-leave/create', data)
    },

    update(id: number, data: Data){
        return axiosClient.put(`/type-leave/update/${id}`, data)
    },
    
    delete(id: number) {
        return axiosClient.delete(`/type-leave/delete/${id}`)
    }
}
export default typeLeaveApi;