import axiosClient from './axiosClient';

const positionApi = {
    getAll() {
        return axiosClient.get('/position/get-all')
    }
}

export default positionApi;