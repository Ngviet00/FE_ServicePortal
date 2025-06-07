import axiosClient from './axiosClient';

const departmentApi = {
    getAll() {
        return axiosClient.get('/department/get-all')
    }
}

export default departmentApi;