import React, { useMemo, useState } from 'react';
import { ChevronDown, Check, Save, AlertTriangle, Users, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import roleApi, { IRole, useSaveOrgPositionWithRole } from '@/api/roleApi';
import positionApi from '@/api/orgPositionApi';
import { ShowToast } from '@/lib';

const ConfigOrgPositionRole: React.FC = () => {
    const [selectedOrgPositionId, setSelectedOrgPositionId] = useState<number | null>(null);
    const [currentAssignedRoles, setCurrentAssignedRoles] = useState<number[]>([]);

    const saveOrgPositionWithRole = useSaveOrgPositionWithRole();

    const { data: getAllOrgPositions = [] } = useQuery({
		queryKey: ['get-all-org-positions'],
		queryFn: async () => {
			const res = await positionApi.GetOrgPositionsByDepartmentId({
                departmentId: null
            })
			return res.data.data
		},
	});

    const { data: roles = [], isPending: isPendingRoles } = useQuery({
        queryKey: ['get-all-role'],
        queryFn: async () => {
            const res = await roleApi.getAll({
                page: 1,
                pageSize: 300
            });
            return res.data.data;
        },
    });

    const handleOnChangeOrgPosition = async (orgPositionId: number) => {
        setSelectedOrgPositionId(orgPositionId)
        const rsRoleOrgPositionIds = await roleApi.getRoleByOrgPositionId({
            orgPositionId: orgPositionId
        })
        const result = rsRoleOrgPositionIds.data.data
        const roleIds = result.map((x: IRole) => x.id);
        setCurrentAssignedRoles(roleIds);
    }

    const selectedPositionName: string = useMemo(() => 
        getAllOrgPositions.find((p: {id: number}) => p.id === selectedOrgPositionId)?.name || 'Chọn Chức Vụ...', 
        [selectedOrgPositionId, getAllOrgPositions]
    );

    const handleRoleToggle = (roleId: number) => {
        const newSet = new Set(currentAssignedRoles);
        if (newSet.has(roleId)) {
            newSet.delete(roleId);
        } else {
            newSet.add(roleId);
        }
        setCurrentAssignedRoles(Array.from(newSet));
    };

    // Xử lý lưu dữ liệu
    const handleSave = async () => {
        if (selectedOrgPositionId === null) {
            ShowToast('Vui lòng chọn một chức vụ để cập nhật.', 'error');
            return;
        }

        if (currentAssignedRoles.length <= 0) {
            ShowToast('Vui lòng chọn một vai trò để cập nhật.', 'error');
            return;
        }

        await saveOrgPositionWithRole.mutateAsync({
            OrgPositionId: selectedOrgPositionId,
            RoleIds: currentAssignedRoles
        })
    };

    return (
        <div className="p-4 pl-1 pt-0 list-role">
            <header className="mb-4 border-b pb-4">
                <h3 className="font-bold text-2xl m-0">Quản Lý Phân Quyền Vị Trí</h3>
            </header>

            <div className="mx-auto">
                <div className="mb-6 pb-4 border-b">
                    <label htmlFor="position-select" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-indigo-500" />
                        Chọn Chức Vụ Áp Dụng:
                    </label>
                    <div className="relative">
                        <select
                            id="position-select"
                            value={selectedOrgPositionId ?? ''}
                            onChange={(e) => handleOnChangeOrgPosition(parseInt(e.target.value))}
                            className="cursor-pointer w-full appearance-none rounded-lg border border-gray-300 py-3 pl-4 pr-10 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out bg-white shadow-sm"
                        >
                            <option value="0">-- Vui lòng chọn một chức vụ --</option>
                            {getAllOrgPositions.map((p: {id: number, name: string}) => (
                                <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Roles được gán cho: <span className="text-indigo-600">{selectedPositionName}</span>
                    </h2>
                    
                    {isPendingRoles ? (
                        <div className="p-6 text-center text-indigo-600 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Đang tải danh sách Roles...
                        </div>
                    ) : selectedOrgPositionId === null || selectedOrgPositionId == 0  ? (
                        <div className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg flex items-center">
                             <AlertTriangle className="w-5 h-5 mr-3" />
                             Vui lòng chọn một chức vụ ở trên để bắt đầu phân quyền.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {roles.map((role: IRole, idxRole: number) => (
                                <div
                                    key={idxRole}
                                    onClick={() => handleRoleToggle(role.id)}
                                    className={`
                                        flex items-center justify-between p-3 rounded-xl border cursor-pointer transition duration-150 ease-in-out
                                        ${currentAssignedRoles.includes(role.id) 
                                            ? 'bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-300'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <span className={`font-medium ${currentAssignedRoles.includes(role.id) ? 'text-indigo-700' : 'text-gray-800'}`}> 
                                        {role.name}
                                    </span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${currentAssignedRoles.includes(role.id) 
                                            ? 'bg-indigo-600 border-indigo-600' 
                                            : 'bg-gray-100 border-gray-300'
                                        }`}
                                    >
                                        {currentAssignedRoles.includes(role.id) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t">
                    <button
                        onClick={handleSave}
                        disabled={selectedOrgPositionId === null || saveOrgPositionWithRole.isPending || isPendingRoles} 
                        className={`
                            ${selectedOrgPositionId === null || saveOrgPositionWithRole.isPending || isPendingRoles
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl active:bg-indigo-800'
                            }
                            flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-xl transition duration-300 ease-in-out shadow-lg cursor-pointer
                        `}
                    >
                        {saveOrgPositionWithRole.isPending ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Đang Lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Lưu Cấu Hình Quyền
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigOrgPositionRole;