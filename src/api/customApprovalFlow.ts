import axiosClient from './axiosClient';

export interface ICustomApprovalFlow {
    id?: number | null,
    department_id?: number | null,
    type_custom_approval?: string | null,
    from?: string | null,
    to?: string | null,
    page?: number | null,
    page_size?: number | null,
    department?: {
        id: number,
        name: string | null
    }
}

const customApprovalFlowApi = {
    getAll(params: ICustomApprovalFlow) {
        return axiosClient.get('/custom-approval-flow/get-all', {params})
    },

    getById(id: number) {
        return axiosClient.get(`/custom-approval-flow/get-by-id/${id}`)
    },

    create(data: ICustomApprovalFlow) {
        return axiosClient.post('/custom-approval-flow/create', data)
    },

    update(id: number, data: ICustomApprovalFlow){
        return axiosClient.put(`/custom-approval-flow/update/${id}`, data)
    },

    delete(id: number) {
        return axiosClient.delete(`/custom-approval-flow/delete/${id}`)
    }
}

export default customApprovalFlowApi;