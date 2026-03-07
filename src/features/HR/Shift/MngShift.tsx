/* eslint-disable @typescript-eslint/no-explicit-any */
import shiftApi, { useExportHoliday, useExportShift, useImportDayOff, useImportShift, useUpdateMngShift } from '@/api/HR/shiftApi';
import orgUnitApi from '@/api/orgUnitApi';
import MonthYearFlatPickr from '@/components/ComponentCustom/MonthYearFlatPickr';
import { Spinner } from '@/components/ui/spinner';
import { useDebounce } from '@/lib';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ShiftRow from './components/ShiftRowComponent';
import ActionModal from './components/ActionModal';

const getDaysInMonth = (yearMonth: string) => {
    if (!yearMonth) return [];
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        return {
            day: day.toString().padStart(2, '0'),
            dayDisplay: day,
            isSun: dayOfWeek === 0,
            dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' })
        };
    });
};

const MngShift = () => {
    const lang = useTranslation().i18n.language.split('-')[0]
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<any>([]);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [dayOffFile, setDayOffFile] = useState<File | null>(null);
    const [shiftFile, setShiftFile] = useState<File | null>(null);
    const debouncedName = useDebounce(searchTerm, 300);
    const queryClient = useQueryClient();

    const [month, setMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-departments'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data
        },
    });

    const { data: shifts = [] } = useQuery({
        queryKey: ['get-all-shift'],
        queryFn: async () => {
            const res = await shiftApi.getAllShift({ pageSize: 200 })
            return res.data.data
        },
    });

    const selectedDeptName = useMemo(() => {
        return departments.find((d: any) => d.id.toString() === selectedDepartment.toString())?.name || "";
    }, [selectedDepartment, departments]);

    const { data: mngShifts = [], isPending: isMngShiftsPending, isFetching: isMngShiftsFetching } = useQuery({
        queryKey: ['get-mng-shifts', month, selectedDepartment, debouncedName, currentPage],
        queryFn: async () => {
            const res = await shiftApi.getManagementShift({
                dayMonth: month,
                departmentName: selectedDeptName || null,
                page: currentPage,
                keySearch: debouncedName || null
            })
            return res.data.data
        },
        placeholderData: keepPreviousData,
    });
    
    const [bulkData, setBulkData] = useState({ 
        fromDay: '1', 
        toDay: '1', 
        shift: 'A1',
        shiftSearch: ''
    });

    const exportShift = useExportShift();
    const handleExportShift = async () => {
        await exportShift.mutateAsync({
            dayMonth: month,
            departmentId: selectedDepartment ? Number(selectedDepartment) : null,
            keySearch: searchTerm || null
        })
    }

    const exportHoliday = useExportHoliday();
    const handleExportHoliday = async () => {
        await exportHoliday.mutateAsync({
            dayMonth: month,
            departmentId: selectedDepartment ? Number(selectedDepartment) : null,
            keySearch: searchTerm || null
        })
    }

    const importDayOff = useImportDayOff();
    const handleImportDayOff = async () => {
        if (!dayOffFile) return;

        const formData = new FormData();
        formData.append('file', dayOffFile);
        formData.append('dayMonth', month);

        await importDayOff.mutateAsync(formData)

        setDayOffFile(null)

        queryClient.invalidateQueries({ queryKey: ['get-mng-shifts', month, selectedDepartment, debouncedName, currentPage] })
    }
    
    const importShift = useImportShift();
    const handleImportShift = async () => {
        if (!shiftFile) return;

        const formData = new FormData();
        formData.append('file', shiftFile);
        formData.append('dayMonth', month);

        await importShift.mutateAsync(formData)

        setShiftFile(null)

        queryClient.invalidateQueries({ queryKey: ['get-mng-shifts', month, selectedDepartment, debouncedName, currentPage] })
    }

    const updateMngShift = useUpdateMngShift();
    const handleUpdateMngShift = async () => {
        const from = Number(bulkData.fromDay);
        const to = Number(bulkData.toDay);

        if (from > to) {
            alert(lang === 'vi' ? 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc' : 'From day must be less than or equal to To day');
            return;
        }

        if (selectedIds.length === 0) {
            alert(lang === 'vi' ? 'Vui lòng chọn ít nhất một nhân viên' : 'Please select at least one employee');
            return;
        }

        const data = {
            dayMonth: month,
            userCodes: selectedIds,
            shiftCode: bulkData.shift,
            from: String(from).padStart(2, '0'),
            to: String(to).padStart(2, '0')
        };

        await updateMngShift.mutateAsync(data);

        setIsActionModalOpen(false);
        setSelectedIds([]);

        queryClient.invalidateQueries({ queryKey: ['get-mng-shifts', month, selectedDepartment, debouncedName, currentPage] })
    }

    const daysInMonth = useMemo(() => getDaysInMonth(month), [month]);
    const numberDayInMonth = daysInMonth.length;

    const filteredShifts = useMemo(() => {
        if (!bulkData.shiftSearch) return shifts;
        
        const searchLower = bulkData.shiftSearch.toLowerCase();
        return shifts.filter((shift: any) => 
            shift.shiftCode.toLowerCase().includes(searchLower)
        );
    }, [shifts, bulkData.shiftSearch]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
    const pageEmployeeIds = useMemo(() => {
        return (mngShifts?.results ?? []).map((emp: any) => emp.EmployeeNo);
    }, [mngShifts?.results]);

    const allChecked = useMemo(() => {
        if (pageEmployeeIds.length === 0) return false;
        return pageEmployeeIds.every((id: any) => selectedSet.has(id));
    }, [pageEmployeeIds, selectedSet]);

    const toggleSelected = useCallback((id: any) => {
        setSelectedIds((prev: any[]) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }, []);

    const openModal = useCallback(() => setIsActionModalOpen(true), []);
    const closeModal = useCallback(() => setIsActionModalOpen(false), []);  

    return (
        <div className="p-1 pl-1 pt-0 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Quản lý ca' : 'Shift Management'}</h3>
            </div>
            <div className='flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative'>
                <header className="bg-white border-b z-40 shadow-sm shrink-0">
                    <div className="flex items-center py-2 justify-between">
                        <div className="flex items-center gap-2 shrink-0">
                            <label className="whitespace-nowrap">
                                {lang == 'vi' ? 'Tháng:' : 'Month:'}
                            </label>
                            <div className="">
                                <MonthYearFlatPickr
                                    value={month}
                                    onChange={setMonth}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <label htmlFor="department" className="whitespace-nowrap">
                                {lang == 'vi' ? 'Bộ phận:' : 'Department:'}
                            </label>
                            <select
                                value={selectedDepartment}
                                id="department"
                                onChange={(e) => {
                                    setSelectedDepartment(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border py-1.5 px-2 rounded text-sm focus:outline-none min-w-[160px] hover:cursor-pointer"
                            >
                                <option value="">-- {lang == 'vi' ? 'Tất cả' : 'All'} --</option>
                                {departments.map((item: {id: number, name: string}) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <label className="whitespace-nowrap">
                                {lang == 'vi' ? 'Tìm kiếm:' : 'Search:'}
                            </label>
                            <input 
                                type="text" 
                                placeholder={lang == 'vi' ? 'Tìm kiếm theo mã,...' : 'Search by usercode,...'}
                                className="pl-3 py-1.5 border rounded text-[14px] w-60 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                            />
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <label className="whitespace-nowrap font-medium text-slate-500">
                                {lang == 'vi' ? 'Trang:' : 'Page:'}
                            </label>
                            <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50/50 p-1">
                                <button 
                                    type="button"
                                    disabled={currentPage === 1 || isMngShiftsPending} 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                    className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-20 transition-all hover:cursor-pointer text-slate-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <span className="text-[13px] font-bold px-2 text-slate-700 min-w-[60px] text-center tracking-tight">
                                    {currentPage} / {isMngShiftsPending ? (mngShifts?.totalPages || '...') : (mngShifts?.totalPages || 1)}
                                </span>

                                <button 
                                    type="button"
                                    disabled={currentPage >= (mngShifts?.totalPages || 1) || mngShifts?.results?.length === 0 || isMngShiftsPending} 
                                    onClick={() => setCurrentPage(p => p + 1)} 
                                    className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-20 transition-all hover:cursor-pointer text-slate-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    {!dayOffFile ? (
                                        <>
                                            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-orange-200 text-orange-700 rounded font-bold text-[13px] hover:bg-orange-50 transition shadow-sm cursor-pointer group">
                                                {lang == 'vi' ? 'Nhập ngày nghỉ' : 'Import Holiday'}
                                                <input type="file" accept=".xlsx, .xls" className="hidden" 
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setDayOffFile(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <button disabled={exportHoliday.isPending} onClick={handleExportHoliday} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded font-bold text-[13px] hover:bg-slate-50 transition shadow-sm cursor-pointer">
                                                {exportHoliday.isPending ? <Spinner className='text-black'/> : lang == 'vi' ? 'Xuất ngày nghỉ' : 'Export Holiday'}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                            <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-1.5 rounded border border-orange-200 max-w-[200px] truncate font-medium">
                                                {dayOffFile?.name}
                                            </span>
                                            <button disabled={importDayOff.isPending} onClick={handleImportDayOff} className="px-3 py-1.5 bg-orange-600 text-white rounded font-bold text-[13px] hover:bg-orange-700 shadow-sm transition cursor-pointer">
                                                {importDayOff.isPending ? <Spinner className='text-white'/> : lang == 'vi' ? 'Xác nhận' : 'Confirm'}
                                            </button>
                                            <button onClick={() => setDayOffFile(null)} className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded font-bold text-[13px] hover:bg-slate-300 transition cursor-pointer">
                                                {lang == 'vi' ? 'Hủy' : 'Cancel'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            {lang == 'vi' ? 'Tổng' : 'Total'}: <span className="font-bold">{mngShifts?.totalItems ?? 0}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                    {!shiftFile ? (
                                        <>
                                            <button disabled={exportShift.isPending} onClick={handleExportShift} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded font-bold text-[13px] hover:bg-slate-50 transition shadow-sm cursor-pointer">
                                                {exportShift.isPending ? <Spinner className='text-black'/> : lang == 'vi' ? 'Xuất ca' : 'Export Shift'}
                                            </button>
                                            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded font-bold text-[13px] hover:bg-green-50 transition shadow-sm cursor-pointer group">
                                                {lang == 'vi' ? 'Nhập Ca' : 'Import Shift'}
                                                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                        if (file) {
                                                            setShiftFile(file);
                                                        }
                                                    }}/>
                                            </label>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                            <button onClick={() => setShiftFile(null)} className="px-3 py-1.5 bg-slate-200 text-slate-600 rounded font-bold text-[13px] hover:bg-slate-300 transition cursor-pointer">
                                                {lang == 'vi' ? 'Hủy' : 'Cancel'}
                                            </button>
                                            <button disabled={importShift.isPending} onClick={handleImportShift} className="px-3 py-1.5 bg-green-600 text-white rounded font-bold text-[12px] hover:bg-green-700 shadow-sm transition cursor-pointer">
                                                {importShift.isPending ? <Spinner className='text-white'/> : lang == 'vi' ? 'Xác nhận' : 'Confirm'}
                                            </button>
                                            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-1.5 rounded border border-green-200 max-w-[200px] truncate font-medium">
                                                {shiftFile?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    <div className="bg-white border border-slate-200 rounded shadow-sm h-full overflow-auto relative">
                        <table className={`w-full ${isMngShiftsPending || isMngShiftsFetching ? 'opacity-30' : 'opacity-100'}`}>
                            <thead>
                                <tr className="bg-slate-50 font-bold text-slate-500">
                                    <th className="sticky left-0 top-0 z-40 w-10 bg-slate-50 border-b border-r border-slate-200 p-2 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded w-4 h-4 hover:cursor-pointer accent-black"
                                            onChange={(e) => setSelectedIds(e.target.checked ? pageEmployeeIds : [])}
                                            checked={allChecked}
                                            />
                                    </th>
                                    <th className="sticky left-10 text-[14px] top-0 z-40 w-44 bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-left shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                                        {lang == 'vi' ? 'Họ tên': 'Employee'}
                                    </th>
                                    <th className="sticky top-0 z-20  text-[14px] w-28 bg-slate-50 border-b border-r border-slate-200 px-3 py-3 text-left">{lang == 'vi' ? 'Bộ phận' : 'Department'}</th>
                                    {daysInMonth.map((item) => (
                                        <th 
                                            key={item.day} 
                                            className={`sticky top-0 z-20 min-w-[38px] border-b border-r border-slate-200 py-1.5 text-center 
                                            ${item.isSun ? 'bg-pink-100 text-red-600' : 'bg-slate-50 text-slate-400'}`}
                                        >
                                            <div className="text-[13px] font-bold">{item.dayDisplay}</div>
                                            <div className="text-[9px] uppercase font-medium">{item.dayName}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">

                                {mngShifts?.results?.length > 0 ? (
                                    mngShifts.results.map((emp: any) => (
                                        <ShiftRow
                                            key={emp.EmployeeNo}
                                            emp={emp}
                                            numberDayInMonth={numberDayInMonth}
                                            selected={selectedSet.has(emp.EmployeeNo)}
                                            onToggle={toggleSelected}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={34} className="py-20 text-center bg-white">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth="2" 
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                                    />
                                                </svg>
                                                <p className="text-slate-500 font-medium">
                                                    {lang === 'vi' ? 'Không tìm thấy dữ liệu' : 'No found data'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>

                {selectedIds.length > 0 && (
                    <div className="fixed bottom-25 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4">
                        <span className="text-[13px] font-black">{lang == 'vi' ? `Đang chọn ${selectedIds.length} người` : `Selected ${selectedIds.length} employees`}</span>
                        <button onClick={openModal} className="px-4 py-1.5 bg-white text-black rounded-full text-[13px] cursor-pointer font-black hover:bg-slate-200 transition">{lang == 'vi' ? 'Thay đổi ca' : 'Change Shifts'}</button>
                        <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                )}

                <ActionModal
                    open={isActionModalOpen}
                    lang={lang}
                    shifts={shifts}
                    filteredShifts={filteredShifts}
                    bulkData={bulkData}
                    setBulkData={setBulkData}
                    loading={updateMngShift.isPending}
                    onClose={closeModal}
                    onConfirm={handleUpdateMngShift}
                />
            </div>
        </div>
    );
};

export default MngShift;