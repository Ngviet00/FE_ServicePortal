import axiosClient from './axiosClient';

interface data {
    name: string
    department_id: number | null
}

interface GetTeam {
    name?: string;
    page: number;
    page_size: number;
}

const teamApi = {
    getAll(params: GetTeam) {
        return axiosClient.get('/team/get-all', {params})
    },
    getById(id: number) {
        return axiosClient.get(`/team/get-by-id/${id}`)
    },
    create(data: data) {
        return axiosClient.post('/team/create', data)
    },
    update(id: number, data: data){
        return axiosClient.put(`/team/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/team/delete/${id}`)
    }
}

export default teamApi;