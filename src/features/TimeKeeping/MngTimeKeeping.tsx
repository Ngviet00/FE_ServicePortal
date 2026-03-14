/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import timekeepingApi, { useCreateRequestApprovalTimeSheet, useExportTimesheet } from "@/api/HR/timeKeepingApi";
import { getDaysInMonth, useDebounce } from "@/lib";
import MonthYearFlatPickr from "@/components/ComponentCustom/MonthYearFlatPickr";
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import userApi from "@/api/userApi";

export default function MngTimekeeping() {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split("-")[0];
    const [deptId, setDept] = useState('')
    const [keySearch, setKeySearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedName = useDebounce(keySearch, 300);
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [month, setMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const daysInMonth = useMemo(() => getDaysInMonth(month), [month]);
    const numberDayInMonth = daysInMonth.length;

    const { data: departments = [] } = useQuery({
        queryKey: ["get-mng-orgunit-timekeeping"],
        queryFn: async () => {
            const res = await userApi.getManagedOrgUnitTimeKeeping(user?.userCode ?? '');
            return res.data.data;
        },
    });

    const selectedDeptName = useMemo(() => {
        return departments.find((d: any) => d.id.toString() === deptId.toString())?.name || "";
    }, [deptId, departments]);

    const { data: mngTimeKeepings = [], isPending: isPendingMngTimeKeeping, isFetching: isFetchingMngTimeKeeping } = useQuery({
        queryKey: ['get-mng-timekeeping', month, deptId, debouncedName, currentPage],
        queryFn: async () => {
            if (deptId == '' && debouncedName == '') {
                return []
            }

            const res = await timekeepingApi.getMngTimeKeeping({
                UserCode: debouncedName || null,
                YearMonth: month,
                DepartmentName: selectedDeptName,
                Page: currentPage,
                PageSize: 50
            })
            return res.data.data
        }
    });

    const createApprovalTimeSheet = useCreateRequestApprovalTimeSheet()
    const handleCreateRequestApprovalTimeKeeping = async () => {
        await createApprovalTimeSheet.mutateAsync({
            orgPositionId: user?.orgPositionId ?? -1,
            userName: user?.userName ?? "",
            userCode: user?.userCode,
            yearMonth: month,
            departmentId: deptId,
            departmentName: selectedDeptName
        });
        navigate("/list-time-keeping");
    };

    const exportTimesheet = useExportTimesheet()
    const handleExportTimeSheet = async () => {
        await exportTimesheet.mutateAsync({
            yearMonth: month,
            deptId: deptId,
            departmentName: selectedDeptName
        })
    }

    const { data: typeLeaves } = useQuery<ITypeLeave[], Error>({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        }
    });

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">
                    {t("mng_time_keeping.mng_time_keeping")}
                </h3>
            </div>

            <div className="flex flex-wrap gap-4 items-center mt-3 mb-3 lg:justify-between">
                <div className="flex space-x-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <MonthYearFlatPickr
                            value={month}
                            onChange={setMonth}
                        />
                    </div>
                    <div>
                        <input
                            value={keySearch}
                            onChange={(e) => {
                                setKeySearch(e.target.value)
                                setCurrentPage(1)
                            }}
                            type="text"
                            className="border p-1.5 rounded-[5px] pl-1 text-sm border-gray-300"
                            placeholder={lang == 'vi' ? 'Mã nhân viên' : 'Usercode'}
                        />
                    </div>
                    <div>
                        <select
                            className="text-sm  border-gray-300 border w-50 h-[33px] rounded-[5px] hover:cursor-pointer"
                            value={deptId}
                            onChange={(e) => {
                                const val = e.target.value 
                                setDept(val)
                                setCurrentPage(1)
                            }}
                            >
                            <option value="" className="text-sm">
                                --{lang == "vi" ? "Bộ phận" : "Department"}--
                            </option>
                            {departments.map((item: { id: number; name: string }, idx: number) => (
                                <option key={idx} className="text-sm" value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <label className="whitespace-nowrap font-medium text-slate-500">
                            {lang == 'vi' ? 'Trang:' : 'Page:'}
                        </label>
                        <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50/50 p-1">
                            <button 
                                type="button"
                                disabled={currentPage === 1 || isPendingMngTimeKeeping} 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-20 transition-all hover:cursor-pointer text-slate-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <span className="text-[13px] font-bold px-2 text-slate-700 min-w-[60px] text-center tracking-tight">
                                {currentPage} / {isPendingMngTimeKeeping ? (mngTimeKeepings?.totalPages || '...') : (mngTimeKeepings?.totalPages || 1)}
                            </span>

                            <button 
                                type="button"
                                disabled={currentPage >= (mngTimeKeepings?.totalPages || 1) || mngTimeKeepings?.results?.length === 0 || isPendingMngTimeKeeping} 
                                onClick={() => setCurrentPage(p => p + 1)} 
                                className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-20 transition-all hover:cursor-pointer text-slate-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            className="cursor-pointer py-1 px-3 bg-black hover:bg-gray-800 text-white text-[15px] rounded-[3px]"
                            onClick={() => navigate("/list-time-keeping")}
                        >
                            {lang === "vi" ? "Danh sách xác nhận BCC" : "List timesheet"}
                        </button>
                        {
                            mngTimeKeepings.results?.length > 0 && (
                                <>
                                    <button
                                        disabled={createApprovalTimeSheet.isPending}
                                        className="cursor-pointer py-1 px-3 bg-green-500 hover:bg-green-700 text-white text-[15px] rounded-[3px] mx-4"
                                        onClick={handleCreateRequestApprovalTimeKeeping}
                                    >
                                        {createApprovalTimeSheet.isPending ? <Spinner /> : lang === "vi" ? "Đăng ký" : "Register"}
                                    </button>
                                    <button
                                        disabled={exportTimesheet.isPending}
                                        className="cursor-pointer py-1 px-3 bg-blue-500 hover:bg-blue-700 text-white text-[15px] rounded-[3px]"
                                        onClick={handleExportTimeSheet}
                                    >
                                        {exportTimesheet.isPending ? <Spinner/> : lang === "vi" ? "Xuất excel" : "Export excel"}
                                    </button>
                                </>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-4 items-center">
                {typeLeaves?.map((item: any, idx: number) => {
                    return (
                        <div
                            className="flex items-center flex-shrink-0 transition-colors duration-150 ease-in-out group"
                            key={idx}
                        >
                            <span
                                className="text-black font-bold bg-gray-200 w-[50px] h-[22px] text-[13px] text-center inline-flex items-center justify-center rounded-[3px] mr-2 flex-shrink-0 shadow-sm"
                            >
                                {item?.code}
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">
                                {lang === 'vi' ? item?.name : item?.nameE}
                            </span>
                        </div>
                    );
                })}
            </div>

            <main className="flex-1 overflow-auto mt-5">
                <div className="bg-white border border-slate-200 rounded shadow-sm h-full overflow-auto relative">
                    <table className={`w-full ${isPendingMngTimeKeeping || isFetchingMngTimeKeeping ? 'opacity-30' : 'opacity-100'}`}>
                        <thead>
                            <tr className="bg-slate-50 font-bold text-slate-500">
                                <th className="sticky text-[14px] top-0 z-40 w-50 bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-center shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                                    {lang == 'vi' ? 'Họ tên': 'Employee'}
                                </th>
                                <th className="sticky top-0 z-20  text-[14px] w-50 bg-slate-50 border-b border-r border-slate-200 px-3 py-3 text-center">{lang == 'vi' ? 'Bộ phận' : 'Department'}</th>
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
                            {mngTimeKeepings?.results?.length > 0 ? (
                                mngTimeKeepings.results.map((emp: any, idx: number) => {
                                    const arr = [];

                                    for (let i = 1; i <= numberDayInMonth; i++) {
                                        const dayKey = String(i).padStart(2, '0');
                                        const cellValue = emp[dayKey];
                                        const isABS = cellValue === 'ABS';

                                        arr.push(
                                            <td
                                                key={`${emp.UserCode}-${dayKey}`}
                                                className={`shift-cell border-r border-slate-100 text-center text-[13px] font-bold py-2.5 border-b
                                                    ${isABS ? 'text-red-600 bg-red-100' : ''}
                                                `}
                                            >
                                                {cellValue || '-'}
                                            </td>
                                        );
                                    }
                                    return (
                                        <tr key={idx} className={`hover:bg-slate-50/50 transition-colors`}>
                                            <td className="sticky z-10 bg-white border-r border-slate-200 px-4 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b">
                                                <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-400 leading-none">{emp?.UserCode ?? ''}</span>
                                                <span className="text-[13px] font-bold text-slate-700">{emp?.UserName ?? 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 border-r text-center border-slate-100 text-[13px] font-bold border-b">{selectedDeptName}</td>
                                            {arr}
                                        </tr>
                                    );
                                })
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
        </div>
    );
}