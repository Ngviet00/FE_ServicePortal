import axiosClient from './axiosClient';
import { IRole } from './roleApi';

interface data {
    name: string | null
    email: string | null
    dateJoinCompany: Date
}

interface DataUserRole {
    user_code: string,
    role_ids: number[]
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
    sex: number | null,
    position: string | null,
    level: string | null,
    level_parent: string | null,
    roles: IRole[],
    department: {
        id: number,
        name: string
    }
}

const userApi = {
    getMe() {
        return axiosClient.get(`/user/me`)
    },
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
    delete(id: string) {
        return axiosClient.delete(`/user/delete/${id}`)
    },
    orgChart(department_id: number) {
        return axiosClient.get(`/user/org-chart?department_id=${department_id}`)
    },
    updateUserRole(data: DataUserRole) {
        return axiosClient.post(`/user/update-user-role`, data)
    },
}

export default userApi;