import axiosClient from './axiosClient';
import { OrgUnit } from './orgUnitApi';

export interface IOrgPosition {
    id: number | null;
    positionCode: string | null;
    name: string | null;
    orgUnitId: number | null;
    parentOrgPositionId: number | null;
    orgUnit: OrgUnit | null;
}

const positionApi = {
    getAll() {
        return axiosClient.get('/org-position/get-all')
    },
    GetOrgPositionsByDepartmentId(departmentId: number) {
        return axiosClient.get(`/org-position/get-org-positions-by-department-id?departmentId=${departmentId}`)
    }
}

export default positionApi;