import axiosClient from './axiosClient';

const orgUnitApi = {
    GetAllDepartmentAndFirstOrgUnit() {
        return axiosClient.get('/org-unit/get-all-dept-and-first-org-unit')
    }
}


export default orgUnitApi;