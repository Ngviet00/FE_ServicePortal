 
import axiosClient from './axiosClient';

const overTimeApi = {
    getTypeOverTime() {
        return axiosClient.get(`/overtime/type-overtime`)
    },
    create(data: FormData) {
        return axiosClient.post('/overtime', data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    }
    // getAll(params: GetAllParams) {
    //     return axiosClient.get('/role', {params})
    // },
    // getById(id: number) {
    //     return axiosClient.get(`/role/${id}`)
    // },
    // create(data: {name: string}) {
    //     return axiosClient.post('/role', data)
    // },
    // update(id: number, data: {name: string}){
    //     return axiosClient.put(`/role/${id}`, data)
    // },
    // delete(id: number) {
    //     return axiosClient.delete(`/role/${id}`)
    // }
}
export default overTimeApi;