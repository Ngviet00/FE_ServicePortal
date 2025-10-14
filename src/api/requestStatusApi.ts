import axiosClient from './axiosClient';

export interface IRequestStatus {
    id: number;
    name: string;
    nameE: string;
};

const requestStatusApi = {
    getAll() {
        return axiosClient.get('/request-status')
    }
}

export default requestStatusApi;