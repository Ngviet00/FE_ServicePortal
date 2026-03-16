/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import orgUnitApi from '@/api/orgUnitApi';
import unionApi, { useAddMemberUnion, useAssignUnionMngDept } from '@/api/unionApi';
import { getErrorMessage, RoleEnum, ShowToast } from '@/lib';
import MemberList from './MemberList';
import MemberDetail from './MemberDetail';
import AddUserModal from './AddUserModal';
import useHasRole from '@/hooks/useHasRole';
import { useTranslation } from 'react-i18next';

export interface Department { id: number; name: string }
export interface UnionMember {
    id: number;
    userName: string;
    userCode: string;
    title: string;
    dateJoinUnion?: string;
    departments: { departmentId: number; departmentName: string }[];
}

const MngMemberUnion: React.FC = () => {
    const [selectedMember, setSelectedMember] = useState<UnionMember | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDeptId, setCurrentDeptId] = useState<number[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<UnionMember | null>(null);
    const lang = useTranslation().i18n.language.split('-')[0];

    const queryClient = useQueryClient();

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: async () => (await orgUnitApi.GetAllDepartment()).data.data,
    });

    const { data: unionMembers = [], isPending } = useQuery({
        queryKey: ['union-members'],
        queryFn: async () => (await unionApi.getListunionMemberWithDept()).data.data,
    });

    const assignDept = useAssignUnionMngDept();
    const addMember = useAddMemberUnion();

    const isUnionAdmin = useHasRole([RoleEnum.UNION_ADMIN])

    const handleSelectMember = useCallback((member: UnionMember) => {
        setSelectedMember(member);
        setIsEditing(false);
        setCurrentDeptId(member.departments.map(d => d.departmentId));
    }, []);

    const toggleDepartment = useCallback(
        (deptId: number) => {
            setCurrentDeptId(prev =>
                prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
            );
        },
        []
    );

    const handleSave = useCallback(async () => {
        if (!selectedMember) return ShowToast('Please choose at least 1 member', 'error');
        await assignDept.mutateAsync({ UnionMemberId: selectedMember.id, DepartmentId: currentDeptId });
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ['union-members'] });
    }, [selectedMember, currentDeptId, assignDept, queryClient]);

    const handleOpenAddModal = useCallback(() => {
        setEditingMember(null);
        setIsAddUserModalOpen(true);
    }, []);

    const handleEditMember = useCallback((member: UnionMember) => {
        setEditingMember(member);
        setIsAddUserModalOpen(true);
    }, []);

    const handleDeleteMember = useCallback(async (id: number) => {
        if (!confirm(lang == 'vi' ? 'Bạn có muốn xóa?' : 'Do you want to delete?')) return;
        try {
            await unionApi.deleteMemberUnion(id);
            ShowToast(lang == 'vi' ? 'Xóa thành công' : 'Delete success', 'success');
            queryClient.invalidateQueries({ queryKey: ['union-members'] });
            setSelectedMember(null)
        } catch (err) {
            ShowToast(getErrorMessage(err), 'error');
        }
    }, [queryClient]);

    const handleAddUser = useCallback(async (userCode: string, userName: string, title: string, memberUnionId?: number) => {
        await addMember.mutateAsync({ UserCode: userCode, UserName: userName, Title: title, MemberUnionId: memberUnionId});
        setIsAddUserModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['union-members'] });
    }, [addMember, editingMember, queryClient]);

    const selectedMemberDepartments = useMemo(() => new Set(currentDeptId), [currentDeptId]);

    return (
        <div className="min-h-screen font-sans">
            <h3 className="font-bold text-2xl mb-2">
                {lang === 'vi' ? 'Quản lý thành viên, bộ phận' : 'Union Member & Dept Management'}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
                <div className="lg:col-span-1">
                    <MemberList
                        lang={lang}
                        members={unionMembers}
                        isLoading={isPending}
                        selectedMember={selectedMember}
                        onSelectMember={handleSelectMember}
                        onOpenAddModal={handleOpenAddModal}
                        onEditMember={handleEditMember}
                        onDeleteMember={handleDeleteMember}
                        isUnionAdmin={isUnionAdmin}
                    />
                </div>
                <div className="lg:col-span-2">
                    <MemberDetail
                        lang={lang}
                        member={selectedMember}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        setSelectedMember={setSelectedMember}
                        departments={departments}
                        selectedDept={selectedMemberDepartments}
                        toggleDept={toggleDepartment}
                        onSave={handleSave}
                        saveLoading={assignDept.isPending}
                        isUnionAdmin={isUnionAdmin}
                    />
                </div>
            </div>

            {isAddUserModalOpen && (
                <AddUserModal
                    editingMember={editingMember}
                    onClose={() => setIsAddUserModalOpen(false)}
                    onSubmit={handleAddUser}
                />
            )}
        </div>
    );
};

export default MngMemberUnion;