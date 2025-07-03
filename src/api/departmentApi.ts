import axiosClient from './axiosClient';

const departmentApi = {
    getAll() {
        return axiosClient.get('/department/get-all')
    },
    getAllWithDistinctName() {
        return axiosClient.get('/department/get-all-with-distinct-name')
    }
}

export default departmentApi;