import axiosClient from './axiosClient';;

const fileApi = {
    downloadFile(id: string) {
        return axiosClient.get(`/file/download-file/${id}`, {
            responseType: 'blob',
        })
    },
    generateTokenAccessFile(id: number) {
        return axiosClient.post(`/file/generate-token-access-file/${id}`);
    }
}

export default fileApi;