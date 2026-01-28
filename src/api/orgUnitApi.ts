import axiosClient from './axiosClient';
export interface OrgUnit {
    id: number | null,
    name: string | null,
    parentOrgUnitId: number | null,
    unitId: number | null,
    parentOrgUnit?: OrgUnit,
    unit?: {
        id: number,
        name: string
    }
}

export interface IGetAllTeam {
    departmentId?: number | null,
    page: number,
    pageSize: number
}

interface getAllCompanyAndMngDeptAndDept {
    unitId?: number | null,
    page: number,
    pageSize: number
}

const orgUnitApi = {
    getAllUnit() {
        return axiosClient.get('/org-unit/get-all-unit')
    },
    getUnitCompany() {
        return axiosClient.get('/org-unit/get-unit-company')
    },
    CreateOrUpdate(data: OrgUnit) {
        return axiosClient.post('/org-unit/save-or-update', data)
    },
    GetAllDepartment() {
        return axiosClient.get('/org-unit/get-all-departments')
    },
    GetDepartmentsManagedByOrgPositionManager(orgPositionId: number) {
        return axiosClient.get(`/org-unit/get-departments-managed-by-org-position-manager/${orgPositionId}`)
    },
    // GetTeamByDeptIdAndUserNotSetOrgPositionId(departmentId: number) {
    //     return axiosClient.get(`/org-unit/get-team-by-department-id-and-user-not-set-org-position-id-by-department-name?departmentId=${departmentId}`)
    // },

    GetListUserByTeamId(teamId: number) {
        return axiosClient.get(`/org-unit/get-list-user-by-team-id?teamId=${teamId}`)
    },

    SaveChangeOrgUnitManyUser(formData: FormData) {
        return axiosClient.post('/org-unit/save-change-org-unit-many-user', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },

    // GetDepartmentAndChildrenTeam() {
    //     return axiosClient.get(`/org-unit/get-department-and-children-team`)
    // },

    GetAllTeam(params: IGetAllTeam) {
        return axiosClient.get(`/org-unit/get-all-team?`, {params})
    },

    GetAllCompanyAndMngDeptAndDept(params: getAllCompanyAndMngDeptAndDept) {
        return axiosClient.get(`/org-unit/get-all-company-mng-department-department`, {params})
    },
    Delete(id: number | null | undefined) {
        return axiosClient.delete(`/org-unit/${id}`)
    }
}

export default orgUnitApi;