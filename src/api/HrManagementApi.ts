import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, ShowToast } from '@/lib';
import { OptionType } from '@/components/ComponentCustom/MultipleSelect';
import axiosClient from './axiosClient';

interface UserAttendanceInfo {
    userCode: string;
    userName: string;
}

interface GetAllAssignAttendanceUser {
    Key?: string
    DepartmentId?: number,
    Page?: number,
    PageSize?: number,
}

interface SaveAttendanceMultiple {
    userCodes: Array<string>,
    userCodesManage: Array<string>
}

interface ListChangeManageAttendance {
    oldUserManageAttendance: OptionType[],
    newUserManageAttendance: OptionType[],
}

interface SaveHRManagement {
    ManageTimekeeping: OptionType[],
    ManageTraining: OptionType[],
    ManageRecruitment: OptionType[],
}

const HrManagementApi = {
    getAllAssignAttendanceUser(params: GetAllAssignAttendanceUser) {
        return axiosClient.get('/hr-management/get-all-assign-attendance-user', {params})
    },

    getAllHR() {
        return axiosClient.get(`/hr-management/get-all-hr`)
    },

    getAttendanceManager() {
        return axiosClient.get(`/hr-management/attendance-managers`)
    },

    saveAssignAttendanceManagerToUser(data: { data: Array<UserAttendanceInfo> }) {
        return axiosClient.post('/hr-management/assign-attendance-manager-to-user', data)
    },

    saveAttendanceMultiplePeopleToAttendanceManager(data: SaveAttendanceMultiple) {
        return axiosClient.post('/hr-management/attendance-multiple-people-to-attendance-manager', data)
    },

    saveHRMangement(data: SaveHRManagement ) {
        return axiosClient.post('/hr-management/save-hr-management', data)
    },

    saveChangeManageAttendance(data: ListChangeManageAttendance) {
        return axiosClient.post('/hr-management/change-manage-attendance', data);
    },

    getHrManagement() {
        return axiosClient.get('/hr-management/get-hr-managements')
    }
}


export function useSaveAssignAttendanceManagerToUser() {
    return useMutation({
        mutationFn: async (data: { data: Array<UserAttendanceInfo> }) => {
            await HrManagementApi.saveAssignAttendanceManagerToUser(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useSaveAttendanceMultiplePeopleToAttendanceManager() {
    return useMutation({
        mutationFn: async (data: SaveAttendanceMultiple) => {
            await HrManagementApi.saveAttendanceMultiplePeopleToAttendanceManager(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useSaveHRMangement() {
    return useMutation({
        mutationFn: async (data: SaveHRManagement) => {
            await HrManagementApi.saveHRMangement(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useSaveChangeManageAttendance() {
    return useMutation({
        mutationFn: async (data: ListChangeManageAttendance) => {
            await HrManagementApi.saveChangeManageAttendance(data);
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export default HrManagementApi;