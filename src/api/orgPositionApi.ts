import axiosClient from './axiosClient';

const positionApi = {
    getAll() {
        return axiosClient.get('/org-position/get-all')
    },
    GetOrgPositionsByDepartmentId(departmentId: number) {
        return axiosClient.get(`/org-position/get-org-positions-by-department-id?departmentId=${departmentId}`)
    }
}

export default positionApi;