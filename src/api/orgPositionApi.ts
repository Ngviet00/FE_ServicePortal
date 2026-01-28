import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { OrgUnit } from './orgUnitApi';
import { getErrorMessage, ShowToast } from '@/lib';

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
    departmentId?: number | null,
    page?: number | null,
    pageSize?: number | null
}

interface SaveChangeOrgUnitAndOrgPositionOfUser {
    UserCodes: string[],
    OrgPositionId: number
}

const positionApi = {
    SaveOrUpdate(data: {
        id?: number | null;
        code?: string | null;
        name?: string | null;
        departmentId?: number | null;
        teamId?: number | null;
        parentOrgPositionId?: number | null;
        IsStaff: boolean | null;
    }) {
        return axiosClient.post('/org-position/save-or-update', data)
    },
    Delete(id: number | null | undefined) {
        return axiosClient.delete(`/org-position/${id}`)
    },
    GetOrgPositionsByDepartmentId(params: IGetOrgPositionsByDepartmentId) {
        return axiosClient.get(`/org-position/get-org-positions-by-department-id`, {params})
    },
    submitChangeOrgUnitAndOrgPositionOfUser(data: SaveChangeOrgUnitAndOrgPositionOfUser) {
        return axiosClient.post(`/org-position/submit-change-orgunit-and-orgposition-of-user`, data)
    },
    getDataUserPageChangeOrgUnitAndOrgPosition(params: {
        keyword?: string | null,
        page?: number | null,
        pageSize?: number | null,
        orgUnitId?: number | null,
        type: string | null
    }) {
        return axiosClient.get(`/org-position/get-data-user-page-change-orgunit-and-orgposition`, {params})
    },
    getDataPageChangeOrgUnitAndOrgPosition() {
        return axiosClient.get(`/org-position/get-data-page-change-orgunit-and-orgposition`)
    }
}

export function useSubmitChangeOrgUnitAndOrgPositionOfUser() {
    return useMutation({
        mutationFn: async (data: SaveChangeOrgUnitAndOrgPositionOfUser) => {
            await positionApi.submitChangeOrgUnitAndOrgPositionOfUser(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default positionApi;