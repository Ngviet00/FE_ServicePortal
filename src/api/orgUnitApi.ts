import axiosClient from './axiosClient';

interface GetOrgUnitByDept {
    departmentId: number
}

const orgUnitApi = {
    getAllDeptInOrgUnit() {
        return axiosClient.get('/org-unit/get-all-dept-in-org-unit')
    },
    GetOrgUnitByDept(params: GetOrgUnitByDept) {
        return axiosClient.get('/org-unit/get-org-unit-by-dept', {params})
    },
}


export default orgUnitApi;