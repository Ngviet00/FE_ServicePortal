import { ShowToast, getErrorMessage } from '@/lib';
import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';

interface AddMemberUnion {
    UserCode?: string,
    UserName?: string,
    Title?: string,
    DateJoinUnion?: string,
    IsEditing?: boolean,
    MemberUnionId?: number
}

interface assignedUnionMemberMngDepartment {
    UnionMemberId: number,
    DepartmentId: number[]
}

const unionApi = {
    // union mng member
    getListunionMemberWithDept() {
        return axiosClient.get(`/union-mng-member/get-list-union-member-with-dept`)
    },

    assignedUnionMemberMngDepartment(data: assignedUnionMemberMngDepartment) {
        return axiosClient.post('/union-mng-member/assign-union-member-mng-dept', data)
    },

    addMemberUnion(data: AddMemberUnion) {
        return axiosClient.post('/union-mng-member', data)
    },
    
    deleteMemberUnion(unionMemberId: number) {
        return axiosClient.delete(`/union-mng-member/${unionMemberId}`)
    },
    getMemberUnionByDepartment(departmentId: number) {
        return axiosClient.get(`/union-mng-member/get-list-union-member-by-department/${departmentId}`)
    }
    // union mng member
}

export function useDeleteMemberUnion () {
    return useMutation({
        mutationFn: async (unionMemberId: number) => {
            await unionApi.deleteMemberUnion(unionMemberId)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAddMemberUnion() {
    return useMutation({
        mutationFn: async (data: AddMemberUnion) => {
            await unionApi.addMemberUnion(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}

export function useAssignUnionMngDept () {
    return useMutation({
        mutationFn: async (data: assignedUnionMemberMngDepartment) => {
            await unionApi.assignedUnionMemberMngDepartment(data)
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (err) => {
            ShowToast(getErrorMessage(err), "error");
        }
    })
}


export default unionApi;