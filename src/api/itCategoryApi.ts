import axiosClient from './axiosClient';

export interface ITCategoryInterface {
    id: number,
    name: string,
    description: string
}

const itCategoryApi = {
    getAll() {
        return axiosClient.get('/it-category')
    },
}

export default itCategoryApi;