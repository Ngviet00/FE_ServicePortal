import axiosClient from './axiosClient';

interface data {
    name: string | null
    email: string | null
    dateJoinCompany: Date
}

interface GetUser {
    page: number;
    page_size: number;
    name?: string;
}

const userApi = {
    getAll(params: GetUser) {
        return axiosClient.get('/user/get-all', {params})
    },
    getParentDepartment() {
        return axiosClient.get('/user/get-parent-department')
    },
    getById(id: string | undefined) {
        return axiosClient.get(`/user/get-by-id/${id}`)
    },
    create(data: data) {
        return axiosClient.post('/user/create', data)
    },
    update(id: number, data: data){
        return axiosClient.put(`/user/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/user/delete/${id}`)
    }
}

export default userApi;