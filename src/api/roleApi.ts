import axiosClient from './axiosClient';

const roleApi = {
    getAll() {
        return axiosClient.get('/role/get-all')
    },
    delete(id: string) {
        return axiosClient.delete(`/role/${id}`)
    }
}
export default roleApi;