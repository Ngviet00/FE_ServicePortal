import axiosClient from './axiosClient';

const positionApi = {
    getAll() {
        return axiosClient.get('/position/get-all')
    },
    GetPositionsByDepartmentId(departmentId: number) {
        return axiosClient.get(`/position/get-positions-by-department-id?departmentId=${departmentId}`)
    }
}

export default positionApi;