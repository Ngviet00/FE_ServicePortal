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
    nameE: string,
    code: string,
    modifiedBy: string,
    modifiedAt: string,
};

const typeLeaveApi = {
    getAll(params: GetAllParams) {
        return axiosClient.get('/type-leave', {params})
    },

    getById(id: number) {
        return axiosClient.get(`/type-leave/${id}`)
    },

    create(data: Data) {
        return axiosClient.post('/type-leave', data)
    },

    update(id: number, data: Data){
        return axiosClient.put(`/type-leave/${id}`, data)
    },
    
    delete(id: number) {
        return axiosClient.delete(`/type-leave/${id}`)
    }
}
export default typeLeaveApi;