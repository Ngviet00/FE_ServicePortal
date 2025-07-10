import axiosClient from './axiosClient';

const orgUnitApi = {
    GetAllDepartmentAndFirstOrgUnit() {
        return axiosClient.get('/org-unit/get-all-dept-and-first-org-unit')
    },
    GetOrgUnitBeingMngTimeKeepingByUser(userCode: string) {
        return axiosClient.get(`/org-unit/get-org-unit-being-mng-timekeeping-by-user?userCode=${userCode}`)
    },
}


export default orgUnitApi;