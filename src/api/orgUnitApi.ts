import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

interface SaveChangeOrgUnitUser {
    UserCodes: string[],
    OrgPositionId: number
}

export interface OrgUnit {
    id: number | null,
    name: string | null,
    parentOrgUnitId: number | null,
    unitId: number | null
}

const orgUnitApi = {
    GetAllDepartment() {
        return axiosClient.get('/org-unit/get-all-departments')
    },

    GetTeamByDeptIdAndUserNotSetOrgPositionId(departmentId: number) {
        return axiosClient.get(`/org-unit/get-team-by-department-id-and-user-not-set-org-position-id-by-department-name?departmentId=${departmentId}`)
    },

    GetListUserByTeamId(teamId: number) {
        return axiosClient.get(`/org-unit/get-list-user-by-team-id?teamId=${teamId}`)
    },

    SaveChangeOrgUnitUser(data: SaveChangeOrgUnitUser) {
        return axiosClient.post('/org-unit/save-change-org-unit-user', data)
    },

    GetDepartmentAndChildrenTeam() {
        return axiosClient.get(`/org-unit/get-department-and-children-team`)
    },

    GetAll() {
        return axiosClient.get(`/org-unit/get-all`)
    },

    GetAllTeam(departmentId?: number) {
        return axiosClient.get(`/org-unit/get-all-team?departmentId=${departmentId}`)
    },

    GetAllWithOutTeam() {
        return axiosClient.get(`/org-unit/get-all-without-team`)
    },
}

export function useSaveChangeOrgUnitUser() {
    return useMutation({
        mutationFn: async (data: SaveChangeOrgUnitUser) => {
            await orgUnitApi.SaveChangeOrgUnitUser(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default orgUnitApi;