/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Search, Hash, UserPlus, Trash2, Users, Plus, Minus, CheckCircle2, X, UserCircle2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import timekeepingApi, { useHRHandleUserMngTimeKeeping, useHRHandleUserOrgUnit } from '@/api/HR/timeKeepingApi';
import { ShowToast, useDebounce } from '@/lib';
import userApi from '@/api/userApi';

const HRManagementTimekeeping = () => {
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ['hr-mng-timekeeping'],
        queryFn: async () => {
            const res = await timekeepingApi.hrMngTimeKeeping();
            return res.data.data; 
        }
    });

    const [selectedEntity, setSelectedEntity] = useState<any>(null);
    const [searchKey, setSearchKey] = useState("");
    const [expandedNodes, setExpandedNodes] = useState<number[]>([]);
    const debouncedName = useDebounce(searchKey, 300);

    const { data: users = [], isFetching: isSearching } = useQuery({
        queryKey: ['hr-mng-search-user', debouncedName],
        queryFn: async () => {
            const res = await userApi.getAll({ Name: debouncedName });
            return res.data.data;
        },
        enabled: debouncedName != ''
    });

    const orgData = useMemo(() => data?.deptResults || [], [data]);
    const availableManagers = useMemo(() => data?.userMngTimeKeepings || [], [data]);

    // CHỖ NÀY: Đưa logic check ra ngoài bằng useMemo và Set
    const assignedCodes = useMemo(() => {
        if (!selectedEntity) return new Set();
        const direct = selectedEntity.directManagers?.map((e: any) => e.userCode || e.UserCode) || [];
        const managers = selectedEntity.managers?.map((e: any) => e.userCode || e.UserCode) || [];
        return new Set([...direct, ...managers]);
    }, [selectedEntity]);

    const handleUserOrgUnit = useHRHandleUserOrgUnit();
    const handleUserMngTimeKeeping = useHRHandleUserMngTimeKeeping();

    const handleAddNewUserMngTimeKeeping = async (userCode: string) => {
        const findUser = availableManagers.find((m: any) => m.UserCode === userCode);
        if (findUser != undefined) {
            ShowToast('Người dùng đã là quản lý chấm công', 'error');
            return;
        }
        await handleUserMngTimeKeeping.mutateAsync({ userCode: userCode, type: 'attach' });
        setSearchKey("");
		setSelectedEntity(null)
        queryClient.invalidateQueries({ queryKey: ['hr-mng-timekeeping'] })
    }

    const handleRemoveUserMngTimeKeeping = async (userCode: string) => {
        await handleUserMngTimeKeeping.mutateAsync({ userCode: userCode, type: 'remove' });
        queryClient.invalidateQueries({ queryKey: ['hr-mng-timekeeping'] })
    }

    const handleUserMngOrgUnit = async (userCode: string, type: string) => {
        if (selectedEntity == null) {
            ShowToast('Vui lòng chọn bộ phận hoặc tổ', 'error')
            return
        }
        await handleUserOrgUnit.mutateAsync({ userCode: userCode, orgUnitId: selectedEntity.id, type: type})
		setSelectedEntity(null)
        queryClient.invalidateQueries({ queryKey: ['hr-mng-timekeeping'] })
    }

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
            <div className="w-[350px] bg-white border-r flex flex-col shadow-sm z-20">
                <div className="border-b">
                    <div className="flex items-center justify-between gap-2 mb-4 p-4">
                        <h2 className="text-lg font-black">Quản lý chấm công</h2>
                        {
                            selectedEntity && <span onClick={() => setSelectedEntity(null)} className='cursor-pointer pr-2 text-sm italic text-red-500 underline underline-offset-1'>Bỏ chọn</span>
                        }
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-1 space-y-1">
                    {orgData.map((dept: any) => (
                        <div key={dept.id}>
                            <div 
                                onClick={() => {
                                    if (dept.teams.length > 0) {
                                        setExpandedNodes(prev => prev.includes(dept.id) ? prev.filter(i => i !== dept.id) : [...prev, dept.id]);
                                    }
                                    setSelectedEntity({ id: dept.id, name: dept.name, type: 'DEPARTMENT', directManagers: dept.directManagers, managers: dept.directManagers });
                                }}
                                className={`flex items-center justify-between p-1.5 rounded-sm cursor-pointer transition-all ${selectedEntity?.id === dept.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {dept.teams.length > 0 ? (expandedNodes.includes(dept.id) ? <Minus size={16}/> : <Plus size={16}/>) : ''}
                                    <span className="text-sm font-bold select-none">{dept.name}</span>
                                </div>
                                {
                                    dept.directManagers.length > 0
                                    ? <span className='text-[12px] bg-blue-400 rounded-[3px] px-[5px] py-[1px] text-white'>{dept.directManagers.map((m: any) => m.userName).join(', ')}</span> 
                                    : null
                                }
                            </div>

                            {expandedNodes.includes(dept.id) && dept.teams.map((team: any) => (
                                <div 
                                    key={team.id}
                                    onClick={() => setSelectedEntity({ id: team.id, name: team.name, type: 'TEAM', managers: team.managers })}
                                    className={`ml-1 mt-1 flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm font-medium ${selectedEntity?.id === team.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-2"><Hash size={14} className="opacity-40"/> {team.name}</div>
                                    {
                                        team.managers.length > 0
                                        ? <span className='text-[12px] bg-blue-400 rounded-[3px] px-[5px] py-[1px] text-white'>{team.managers.map((m: any) => m.userName).join(', ')}</span> 
                                        : <span>Chưa gán</span>
                                    }
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex overflow-hidden p-6 gap-6">
                    <div className="w-1/2 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b bg-slate-50/50">
                            <h3 className="text-sm text-slate-600 flex items-center gap-2"><Users size={16}/>Danh sách quản lý chấm công</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {availableManagers.map((m: any, idx: number) => {
                                const isAssigned = assignedCodes.has(m.UserCode);

                                return (
                                    <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${isAssigned ? 'border-blue-500 bg-blue-300/50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{m.UserCode} - {m.UserName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {
                                                selectedEntity && (
                                                    <>
                                                        {
                                                            !isAssigned && 
                                                            <button disabled={handleUserOrgUnit.isPending} onClick={() => handleUserMngOrgUnit(m.UserCode, 'attach')} className="mr-2 flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-xl text-[11px] hover:bg-green-600 cursor-pointer disabled:bg-gray-400">
                                                                <CheckCircle2 size={16}/> Gán
                                                            </button>
                                                        }
                                                        {
                                                            isAssigned && <button disabled={handleUserOrgUnit.isPending} onClick={() => handleUserMngOrgUnit(m.UserCode, 'remove')} className="mx-3 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-xl text-[11px] hover:bg-red-700 cursor-pointer disabled:bg-gray-400">
                                                                <X size={16}/> Hủy
                                                            </button>
                                                        }
                                                    </>
                                                )
                                            }
                                            <button disabled={handleUserMngTimeKeeping.isPending} onClick={() => handleRemoveUserMngTimeKeeping(m.UserCode)}  className="p-2 text-red-500 bg-red-50 rounded-xl transition-colors cursor-pointer hover:bg-red-100">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="w-1/2 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-sm flex items-center gap-2"><Search size={16}/>Thêm người mới</h3>
                        </div>
                        <div className="p-2 border-b">
                            <div className="relative group">
                                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600" size={18} />
                                <input 
                                    type="text" placeholder="Tìm kiếm theo mã hoặc tên nhân viên..."
                                    value={searchKey} onChange={(e) => setSearchKey(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {!isSearching && users.length > 0 && users.map((user: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{user?.userCode} - {user.userName}</p>
                                        </div>
                                    </div>
                                    <button
                                        disabled={handleUserMngTimeKeeping.isPending}
                                        onClick={() => handleAddNewUserMngTimeKeeping(user?.userCode)}
                                        className="p-3 bg-white text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all active:scale-90 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
                                    >
                                        <UserPlus size={18}/>
                                    </button>
                                </div>
                            ))}

                            {!searchKey && !isSearching && (
                                <div className="h-full flex flex-col items-center justify-center italic text-slate-400">
                                    <Search size={48} className="mb-2"/>
                                    <p className="text-xs font-bold">Tìm tất cả nhân viên</p>
                                </div>
                            )}

                            {!isSearching && searchKey && users.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-red-400 mt-10">
                                    <UserCircle2 size={48} className="mb-2 opacity-20"/>
                                    <p className="text-xs font-bold">Không tìm thấy người dùng nào phù hợp</p>
                                </div>
                            )}

                            {isSearching && (
                                <div className="text-center py-4 text-blue-500 text-xs italic font-medium">Đang tìm dữ liệu...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRManagementTimekeeping;