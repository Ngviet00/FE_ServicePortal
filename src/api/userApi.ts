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

export interface ListUserData {
    id: string,
    code: string,
    name: string | null,
    password: string | null,
    email: string | null,
    role_id: number | null,
    department_id: number | null,
    position_id: number | null,
    date_join_company: string | null,
    date_of_birth: string | null,
    phone: string | null,
    sex: number | null
}

const userApi = {
    getAll(params: GetUser) {
        return axiosClient.get('/user/get-all', {params})
    },
    getById(id: string | undefined) {
        return axiosClient.get(`/user/get-by-id/${id}`)
    },
    getByCode(code: string | undefined) {
        return axiosClient.get(`/user/get-by-code/${code}`)
    },
    update(id: number, data: data){
        return axiosClient.put(`/user/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/user/delete/${id}`)
    }
}

export default userApi;