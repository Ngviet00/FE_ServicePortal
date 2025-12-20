import axiosClient from './axiosClient';;

const fileApi = {
    downloadFile(id: string) {
        return axiosClient.get(`/file/download-file/${id}`, {
            responseType: 'blob',
        })
    }
}

export default fileApi;