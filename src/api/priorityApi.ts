import axiosClient from './axiosClient';

export interface IPriority {
    id: number,
    name: string,
    nameE: string
}

const priorityApi = {
    getAll() {
        return axiosClient.get('/priority')
    },
}

export default priorityApi;