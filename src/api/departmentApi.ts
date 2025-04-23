import axiosClient from './axiosClient';

interface data {
    name: string
    note: string | null
    parent_id: number | null
}

interface GetDepartment {
    page: number;
    page_size: number;
    name?: string;
}

const departmentApi = {
    getAll(params: GetDepartment) {
        return axiosClient.get('/department/get-all', {params})
    },
    getParentDepartment() {
        return axiosClient.get('/department/get-parent-department')
    },
    GetDepartmentWithChildrenDepartmentAndPosition() {
        return axiosClient.get('/department/get-department-with-children-department-and-position')
    },
    getById(id: number) {
        return axiosClient.get(`/department/get-by-id/${id}`)
    },
    create(data: data) {
        return axiosClient.post('/department/create', data)
    },
    update(id: number, data: data){
        return axiosClient.put(`/department/update/${id}`, data)
    },
    delete(id: number) {
        return axiosClient.delete(`/department/delete/${id}`)
    }
}

export default departmentApi;