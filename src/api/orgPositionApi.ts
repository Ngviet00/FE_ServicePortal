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

interface IGetOrgPositionsByDepartmentId {
    departmentId?: number | null
}

const positionApi = {
    GetOrgPositionsByDepartmentId(params: IGetOrgPositionsByDepartmentId) {
        return axiosClient.get(`/org-position/get-org-positions-by-department-id`, {params})
    }
}

export default positionApi;