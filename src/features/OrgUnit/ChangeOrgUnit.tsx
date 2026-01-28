/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    Search, ChevronDown, ChevronRight, Save, Loader2, MapPin, Building2, UserCheck,
    ChevronLeft, ChevronsLeft, ChevronsRight,
    Users,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import positionApi, { useSubmitChangeOrgUnitAndOrgPositionOfUser } from '@/api/orgPositionApi';
import { ShowToast, useDebounce } from '@/lib';

const ChangeOrgUnit = () => {
    const [openDepts, setOpenDepts] = useState<Record<string, boolean>>({});
    const [activeSource, setActiveSource] = useState<{ 
        id: number | null; 
        type: string; 
    }>({ id: null, type: 'all' });
    const [selectedUsers, setSelectedUsers] = useState(new Map()); 
    const [activeTargetDeptId, setActiveTargetDeptId] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState<any>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const pageSize = 50;
    const debouncedName = useDebounce(searchTerm, 300);
    const queryClient = useQueryClient();

    const { data: dataPageChangeOrgUnitAndOrgPosition = [], isLoading: isLoadingDataPage } = useQuery({
        queryKey: ['data-page-change-org-unit-and-org-position'],
        queryFn: async () => {
            const res = await positionApi.getDataPageChangeOrgUnitAndOrgPosition()
            return res.data.data
        },
    });

    const { data: employees = [], isFetching: isEmpFetching } = useQuery({
        queryKey: ['employees', activeSource.id, activeSource.type, page, debouncedName],
        queryFn: async () => {
            const res = await positionApi.getDataUserPageChangeOrgUnitAndOrgPosition({
                keyword: debouncedName,
                page: page,
                pageSize: pageSize,
                orgUnitId: activeSource.id,
                type: activeSource.type
            })
            setTotalPage(res.data.total_pages);
            return res.data.data
        },
        enabled: !!activeSource.id
    });

    useEffect(() => {
        setPage(1);
    }, [activeSource, searchTerm]);

    const toggleUser = (user: any) => {
        const newMap = new Map(selectedUsers);
        if (newMap.has(user.UserCode)) newMap.delete(user.UserCode);
        else newMap.set(user.UserCode, user);
        setSelectedUsers(newMap);
    };

    const submitChangeOrgUnitAndOrgPositionOfUser = useSubmitChangeOrgUnitAndOrgPositionOfUser();

    const handSubmit = async () => {
        if (selectedUsers.size === 0) {
            ShowToast("Chưa chọn nhân viên để chuyển vị trí", 'error');
            return
        }

        if (!selectedPosition) {
            ShowToast("Chưa chọn vị trí", 'error');
            return;
        }

        const userCodes = [...selectedUsers.keys()];

        await submitChangeOrgUnitAndOrgPositionOfUser.mutateAsync({
            UserCodes: userCodes,
            OrgPositionId: selectedPosition.id
        });

        setSelectedUsers(new Map())
        setSelectedPosition(null)
        queryClient.invalidateQueries({ queryKey: ['employees'] })
        queryClient.invalidateQueries({ queryKey: ['data-page-change-org-unit-and-org-position'] })
    }

    return (
        <div className="flex h-[85vh] gap-4 font-sans text-slate-700">
            <div className="w-72 bg-white rounded-3xl border border-slate-200 flex flex-col shadow-sm">
                <div className="p-5 border-b font-bold text-slate-800 flex items-center gap-2">
                    <Building2 size={18} className="text-blue-600" /> Thay đổi vị trí
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {isLoadingDataPage ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-3">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <span className="text-xs font-medium text-slate-400 animate-pulse">
                                Đang tải...
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3">
                                <div 
                                    onClick={() => setActiveSource({ id: -1, type: 'unassigned' })}
                                    className={`group relative flex items-center p-4 rounded-2xl cursor-pointer transition-all border-2 shadow-sm ${
                                        (dataPageChangeOrgUnitAndOrgPosition?.totalUserNotSetOrgPos > 0)
                                        ? 'bg-orange-50 border-orange-400 text-orange-700' 
                                        : 'bg-white border-slate-100 hover:border-orange-200 text-slate-500 hover:bg-orange-50/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 font-bold text-sm z-10">
                                        <div>
                                            <div className="text-sm tracking-tight">Chưa thiết lập vị trí 
                                                {
                                                    dataPageChangeOrgUnitAndOrgPosition?.totalUserNotSetOrgPos > 0 && (<span className='ml-1'>({dataPageChangeOrgUnitAndOrgPosition?.totalUserNotSetOrgPos})</span>)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-2 py-1 rounded-full font-black ${
                                        (dataPageChangeOrgUnitAndOrgPosition?.totalUserNotSetOrgPos > 0) ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        !
                                    </div>
                                </div>
                            </div>

                            {dataPageChangeOrgUnitAndOrgPosition?.data?.map((dept: any) => (
                                <div key={dept.id} className="mb-1">
                                    <div 
                                        onClick={() => {
                                            setOpenDepts((p: any) => ({...p, [dept.id]: !p[dept?.id]}));
                                            setActiveSource({ id: dept.id, type: 'all' });
                                        }}
                                        className={`select-none flex items-center py-2 px-2 rounded-xl cursor-pointer transition-all ${
                                            activeSource.id === dept.id && activeSource.type === 'all' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        {openDepts[dept.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        <span className="ml-2 text-sm font-bold truncate">{dept.name}</span>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {openDepts[dept.id] && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} 
                                                animate={{ height: 'auto', opacity: 1 }} 
                                                exit={{ height: 0, opacity: 0 }}
                                                className="ml-6 border-l-2 border-slate-100 pl-2 mt-1 space-y-1 overflow-hidden"
                                            >
                                                <div 
                                                    onClick={() => setActiveSource({ id: dept.id, type: 'direct' })}
                                                    className={`p-2 rounded-lg text-[11.5px] font-semibold cursor-pointer flex items-center gap-2 transition-colors ${
                                                        activeSource.id === dept.id && activeSource.type === 'direct' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <UserCheck size={14} /> Văn phòng
                                                </div>
                                                {dept.teams.map((team: any) => (
                                                    <div 
                                                        key={team.id}
                                                        onClick={() => setActiveSource({ id: team.id, type: 'team' })}
                                                        className={`p-2 rounded-lg text-[11.5px] cursor-pointer transition-colors ${
                                                            activeSource.id === team.id ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {team.name}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* CỘT 2: KHỐI GIỮA (SEARCH + LIST + PAGINATION) */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
                <div className="p-5 border-b bg-white space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            Nhân sự <span className="text-blue-500 text-sm font-normal">({employees.length} kết quả)</span>
                        </h2>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã nhân viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>
                    {
                        selectedUsers.size > 0 && (
                            <div>
                                <div className="text-sm text-slate-600">
                                    Đã chọn <span className="font-bold text-blue-600">{selectedUsers.size}</span> nhân viên | <span><button onClick={() => setSelectedUsers(new Map())} className='text-red-500 underline cursor-pointer'>Xóa đã chọn</button></span>
                                </div>
                                 <div>
                                    <strong>Người đã chọn: </strong>
                                    <span className='text-sm'>{Array.from(selectedUsers.values(), item => `${item.UserCode}-${item.UserName}`).join(', ')}</span>
                                </div>
                            </div>
                        )
                    }
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-slate-50/20">
                    {!activeSource.id ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-sm">Chọn đơn vị nguồn để hiển thị dữ liệu</div>
                    ) : isEmpFetching ? (
                        <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : employees.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">Không tìm thấy nhân viên phù hợp</div>
                    ) : (
                        <div className="grid grid-cols-4 gap-3 content-start">
                            {employees.map((user: any) => (
                                <div 
                                    key={user.UserCode}
                                    onClick={() => toggleUser(user)}
                                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                                        selectedUsers.has(user.UserCode) ? 'border-green-500 bg-green-100' : 'border-white hover:border-blue-200 shadow-sm'
                                    }`}
                                >
                                    <div className="truncate">
                                        <div className="text-sm font-bold text-slate-700 truncate">{user.UserName}</div>
                                        <div className="text-[13px] text-red-600 font-bold">{user.UserCode} - {user?.DepartmentName}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {totalPage > 1 && (
                <div className="p-4 border-t bg-white flex items-center justify-between px-6">
                    <span className="text-xs text-slate-400 font-medium italic">
                        Trang {page} / {totalPage}
                    </span>
                    <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setPage(1)} 
                        disabled={page === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition-all cursor-pointer"
                    ><ChevronsLeft size={16}/></button>
                    
                    <button 
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                        disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-20 text-xs font-bold transition-all text-slate-600 cursor-pointer"
                    ><ChevronLeft size={16}/> Trước</button>

                    <div className="flex gap-1 px-2">
                        {[...Array(totalPage)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            page === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 cursor-pointer'
                            }`}
                        >
                            {i + 1}
                        </button>
                        )).slice(Math.max(0, page - 3), Math.min(totalPage, page + 2))}
                    </div>

                    <button 
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPage))} 
                        disabled={page === totalPage}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-20 text-xs font-bold transition-all text-slate-600 cursor-pointer"
                    >Sau <ChevronRight size={16}/></button>

                    <button 
                        onClick={() => setPage(totalPage)} 
                        disabled={page === totalPage}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-20 transition-all cursor-pointer"
                    ><ChevronsRight size={16}/></button>
                    </div>
                </div>
                )}
            </div>

            {/* CỘT 3: Vị trí chuyển đến */}    
            <div className="w-80 bg-white rounded-3xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
                <div className="p-5 border-b bg-slate-900 text-white">
                    <h2 className="font-bold uppercase text-[10px] tracking-widest opacity-60">Vị trí chuyển đến</h2>
                    <div className="mt-1 font-bold text-sm truncate flex items-center gap-2">
                        <MapPin size={14} className="text-blue-400" />
                        <span className="truncate">
                            {selectedPosition ? selectedPosition?.name : "Chưa chọn vị trí"}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
                    {dataPageChangeOrgUnitAndOrgPosition?.data?.map((dept: any) => (
                        <div key={dept.id} className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setActiveTargetDeptId(activeTargetDeptId === dept.id ? null : dept.id)}
                                className={`w-full flex items-center justify-between p-4 text-sm font-bold transition-all hover:cursor-pointer ${
                                    activeTargetDeptId === dept.id ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} />
                                    {dept.name}
                                </div>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${activeTargetDeptId === dept.id ? 'rotate-180' : ''}`} />
                            </button>

                            {activeTargetDeptId === dept.id && (
                                <div className="p-2 bg-white border-t border-slate-50 space-y-3">
                                    {dept.positions && dept.positions.length > 0 ? (
                                        <div className="space-y-1">
                                            <div className="px-2 py-1 text-[11px] font-black uppercase">Văn phòng</div>
                                            {dept.positions.map((pos: any) => (
                                                <button
                                                    key={pos.id}
                                                    onClick={() => setSelectedPosition(pos)}
                                                    className={`w-full text-left text-[13px] p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                                        selectedPosition?.id === pos.id 
                                                        ? 'bg-blue-600 text-white shadow-md' 
                                                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                                                    }`}
                                                >
                                                    <Briefcase size={12} className={selectedPosition?.id === pos.id ? 'text-blue-200' : 'text-slate-400'} />
                                                    {pos.name}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[13px] text-red-500 italic pl-2 py-1">Chưa có vị trí</div>
                                    )
                                    }

                                    {dept.teams && dept.teams.map((team: any) => (
                                        <div key={team.id} className="space-y-1 mt-2">
                                            <div className="px-2 py-1 text-[11px] font-black text-blue-500 bg-blue-50/50 rounded-md flex items-center gap-1 uppercase">
                                                <Users size={10} /> {team.name}
                                            </div>
                                            <div className="pl-2 space-y-1">
                                                {team.positions && team.positions.length > 0 ? (
                                                    team.positions.map((pos: any) => (
                                                        <button
                                                            key={pos.id}
                                                            onClick={() => setSelectedPosition(pos)}
                                                            className={`w-full text-left p-2.5 text-[13px] rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                                                                selectedPosition?.id === pos.id 
                                                                ? 'bg-blue-600 text-white shadow-md' 
                                                                : 'text-slate-600 border border-transparent'
                                                            }`}
                                                        >
                                                            <Briefcase size={12} className={selectedPosition?.id === pos.id ? 'text-blue-200' : 'text-slate-400'} />
                                                            {pos.name}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="text-[13px] text-red-500 italic pl-6 py-1">Chưa có vị trí</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-5 border-t bg-white">
                    <button 
                        onClick={handSubmit}
                        disabled={selectedUsers.size === 0 || !selectedPosition}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <Save size={18} /> Lưu thay đổi ({selectedUsers.size})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeOrgUnit;