import axiosClient from './axiosClient';;

const fileApi = {
    getFile(id: number) {
        return axiosClient.get(`/file/${id}`);
    },
    downloadFile(id: number) {
        return axiosClient.get(`/file/${id}?download=true`, {
            responseType: 'blob',
        })
    },
    generateTokenAccessFile(id: number) {
        return axiosClient.post(`/file/generate-token-access-file/${id}`);
    }
}

export default fileApi;