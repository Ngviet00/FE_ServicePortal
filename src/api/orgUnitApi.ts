import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import { getErrorMessage, ShowToast } from '@/lib';

interface SaveChangeOrgUnitUser {
    UserCodes: string[],
    OrgUnitId: number
}

const orgUnitApi = {
    GetAllDepartment() {
        return axiosClient.get('/org-unit/get-all-departments')
    },
    GetAllDepartmentAndFirstOrgUnit() {
        return axiosClient.get('/org-unit/get-all-dept-and-first-org-unit')
    },
    GetAllDeptOfOrgUnit() {
        return axiosClient.get('/org-unit/get-all-dept-of-orgunit')
    },
    GetOrgUnitTeamAndUserNotSetOrgUnitWithDept(departmentId: number) {
        return axiosClient.get(`/org-unit/get-orgunit-team-and-user-not-set-orgunit-with-dept?departmentId=${departmentId}`)
    },
    GetOrgUnitUserWithDept(departmentId: number) {
        return axiosClient.get(`/org-unit/get-orgunit-user-by-with-dept?departmentId=${departmentId}`)
    },
    SaveChangeOrgUnitUser(data: SaveChangeOrgUnitUser) {
        return axiosClient.post('/org-unit/save-change-org-unit-user', data)
    }
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