import axiosClient from './axiosClient';
import { OrgUnit } from './orgUnitApi';

export interface IOrgPosition {
    id?: number | null;
    positionCode?: string | null;
    name?: string | null;
    orgUnitId?: number | null;
    parentOrgPositionId?: number | null;
    orgUnit?: OrgUnit | null,
    parentOrgPosition?: IOrgPosition
}

interface IGetOrgPositionsByDepartmentId {
    departmentId?: number | null
}

const positionApi = {
    SaveOrUpdate(data: IOrgPosition) {
        return axiosClient.post('/org-position/save-or-update', data)
    },
    Delete(id: number | null | undefined) {
        return axiosClient.delete(`/org-position/${id}`)
    },
    GetOrgPositionsByDepartmentId(params: IGetOrgPositionsByDepartmentId) {
        return axiosClient.get(`/org-position/get-org-positions-by-department-id`, {params})
    }
}

export default positionApi;