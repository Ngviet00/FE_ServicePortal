/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next"
import timekeepingApi, { useApprovalTimeKeeping, useExportTimesheet, useResolvedTaskTimeKeeping } from "@/api/HR/timeKeepingApi";
import { getDaysInMonth, StatusApplicationFormEnum, useDebounce } from "@/lib";
import { useNavigate } from "react-router-dom";
import MonthYearFlatPickr from "@/components/ComponentCustom/MonthYearFlatPickr";
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ModalConfirm from "@/components/ModalConfirm";
import HistoryApproval from "../Approval/Components/HistoryApproval";

interface ViewApprovalTimeKeepingProps {
    id: string;
    mode?: string
}

export default function ViewApprovalTimeKeeping ({ id, mode }: ViewApprovalTimeKeepingProps) {
    const { t } = useTranslation()
    const lang = useTranslation().i18n.language.split('-')[0]
    const {user} = useAuthStore()
    const [keySearch, setKeySearch] = useState("")
    const navigate = useNavigate()
    const [note, setNote] = useState("")
    const queryClient = useQueryClient()
    const hasId = !!id;
    const [currentPage, setCurrentPage] = useState(1);
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const debouncedName = useDebounce(keySearch, 300);

    const { data: detailTimekeeping = [], isPending: isPendingTimesheet, isFetching: isFetchingTimesheet } = useQuery({
        queryKey: ['detail-timekeeping', id, debouncedName, currentPage],
        queryFn: async () => {
            const res = await timekeepingApi.getDetailTimeKeeping(id, {
                page: currentPage,
                pageSize: 50,
                keySearch: debouncedName  
            })

            return res.data.data
        },
        enabled: hasId
    });

    const daysInMonth = useMemo(() => 
        getDaysInMonth(detailTimekeeping?.timeKeeping?.yearMonth), 
    [detailTimekeeping?.timeKeeping?.yearMonth]);

    const approvalTimeKeeping = useApprovalTimeKeeping()
    const resolvedTaskTimeKeeping = useResolvedTaskTimeKeeping()
    const handleSaveModalConfirm = async (type: string) => {
        setStatusModalConfirm('')

        const payload = {
            RequestTypeId: detailTimekeeping?.timeKeeping?.applicationForm?.requestTypeId,
            RequestStatusId: detailTimekeeping?.timeKeeping?.applicationForm?.requestStatusId,
            applicationFormId: detailTimekeeping?.timeKeeping?.applicationForm?.id,
            applicationFormCode: detailTimekeeping?.timeKeeping?.applicationForm?.code,
            UserCodeApproval: user?.userCode,
            UserNameApproval: user?.userName ?? "",
            OrgPositionId: user?.orgPositionId,
            Status: type == 'approval' ? true : false,
            Note: note
        }

        if (type == 'resolved') {
            await resolvedTaskTimeKeeping.mutateAsync(payload)
        }
        else if (type == 'reject' || type == 'approval') {
            await approvalTimeKeeping.mutateAsync(payload);
        }

        if (detailTimekeeping?.timeKeeping?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
            navigate("/approval/assigned-tasks")
        } else {
            navigate("/approval/pending-approval")
        }   
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }
    
    const exportTimesheet = useExportTimesheet()
    const handleExportTimeSheet = async () => {
        await exportTimesheet.mutateAsync({
            yearMonth: detailTimekeeping?.timeKeeping?.yearMonth,
            deptId: detailTimekeeping?.timeKeeping?.departmentId,
            departmentName: detailTimekeeping?.timeKeeping?.departmentName
        })
    }

    const { data: typeLeaves } = useQuery<ITypeLeave[], Error>({
        queryKey: ['get-all-type-leave'],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({});
            return res.data.data;
        }
    });

    const renderTableHeader = useMemo(() => (
        <tr className="bg-slate-50 font-bold text-slate-500">
            <th className="sticky text-[14px] top-0 z-40 w-50 bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-center shadow-[1px_0_0_rgba(0,0,0,0.05)]">{lang == 'vi' ? 'Họ tên' : 'Employee'}</th>
            <th className="sticky top-0 z-20 text-[14px] w-50 bg-slate-50 border-b border-r border-slate-200 px-3 py-3 text-center">{lang == 'vi' ? 'Bộ phận' : 'Department'}</th>
            {daysInMonth.map((item) => (
                <th key={item.day} className={`sticky top-0 z-20 min-w-[38px] border-b border-r border-slate-200 py-1.5 text-center ${item.isSun ? 'bg-pink-100 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                    <div className="text-[13px] font-bold">{item.dayDisplay}</div>
                    <div className="text-[9px] uppercase font-medium">{item.dayName}</div>
                </th>
            ))}
        </tr>
    ), [daysInMonth, lang]);

    const renderTableBody = useMemo(() => {
        if (!detailTimekeeping?.results || detailTimekeeping.results.length === 0) {
            return (
                <tr>
                    <td colSpan={daysInMonth.length + 2} className="py-20 text-center bg-white">
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-slate-500 font-medium">
                                {lang === 'vi' ? 'Không tìm thấy dữ liệu' : 'No found data'}
                            </p>
                        </div>
                    </td>
                </tr>
            );
        }

        return detailTimekeeping.results.map((emp: any, idx: number) => {
            const rowCells = [];
            for (let i = 1; i <= daysInMonth.length; i++) {
                const dayKey = String(i).padStart(2, '0');
                const cellValue = emp[dayKey];
                const isABS = cellValue === 'ABS';
                rowCells.push(
                    <td
                        key={`${emp.UserCode}-${dayKey}`}
                        className={`border-r border-slate-100 text-center text-[13px] font-bold py-2.5 border-b ${isABS ? 'text-red-600 bg-red-100' : ''}`}
                    >
                        {cellValue || '-'}
                    </td>
                );
            }

            return (
                <tr key={`${emp.UserCode}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white border-r border-slate-200 px-4 py-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-b">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-400 leading-none">{emp?.UserCode}</span>
                            <span className="text-[13px] font-bold text-slate-700">{emp?.UserName}</span>
                        </div>
                    </td>
                    <td className="px-3 py-2 border-r text-center border-slate-100 text-[13px] font-bold border-b">
                        {detailTimekeeping?.timeKeeping?.departmentName}
                    </td>
                    {rowCells}
                </tr>
            );
        });
    }, [detailTimekeeping?.results, daysInMonth, lang]);

    if (hasId && isPendingTimesheet) return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>
    if (!detailTimekeeping) return <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">{lang == 'vi' ? 'Chi tiết bảng chấm công' : 'Detail timesheet'}</h3>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />

            <div className="flex flex-wrap gap-4 items-center mt-3 mb-3 lg:justify-between">
                <div className="flex space-x-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <MonthYearFlatPickr
                            disabled={true}
                            value={detailTimekeeping?.timeKeeping?.yearMonth}
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
                        <select disabled={true} className="text-sm  border-gray-300 border w-50 h-[33px] rounded-[5px] bg-gray-100 hover:cursor-not-allowed">
                            <option value={detailTimekeeping?.timeKeeping?.departmentId} className="text-sm">{detailTimekeeping?.timeKeeping?.departmentName}</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <label className="whitespace-nowrap font-medium text-slate-500">
                            {lang == 'vi' ? 'Trang:' : 'Page:'}
                        </label>
                        <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50/50 p-1">
                            <button 
                                type="button"
                                disabled={currentPage === 1 || isPendingTimesheet} 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                className="p-1 hover:bg-white hover:shadow-sm rounded disabled:opacity-20 transition-all hover:cursor-pointer text-slate-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <span className="text-[13px] font-bold px-2 text-slate-700 min-w-[60px] text-center tracking-tight">
                                {currentPage} / {isPendingTimesheet ? (detailTimekeeping?.totalPages || '...') : (detailTimekeeping?.totalPages || 1)}
                            </span>

                            <button 
                                type="button"
                                disabled={currentPage >= (detailTimekeeping?.totalPages || 1) || detailTimekeeping?.results?.length === 0 || isPendingTimesheet} 
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
                            detailTimekeeping.results?.length > 0 && (
                                <>
                                    <button
                                        disabled={exportTimesheet.isPending}
                                        className="cursor-pointer py-1 px-3 bg-blue-500 hover:bg-blue-700 text-white text-[15px] rounded-[3px] ml-4"
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
                {
                    typeLeaves?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center flex-shrink-0 transition-colors duration-150 ease-in-out group">
                            <span className="text-black font-bold bg-gray-200 w-[50px] h-[22px] text-[13px] text-center inline-flex items-center justify-center rounded-[3px] mr-2 flex-shrink-0 shadow-sm">{item?.code}</span>
                            <span className="text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">{lang === 'vi' ? item?.name : item?.nameE}</span>
                        </div>
                    ))
                }
            </div>

            <main className="flex-1 overflow-auto mt-5">
                <div className="bg-white border border-slate-200 rounded shadow-sm h-full overflow-auto relative">
                    <table className={`w-full ${isPendingTimesheet || isFetchingTimesheet ? 'opacity-30' : 'opacity-100'}`}>
                        <thead>{renderTableHeader}</thead>
                        <tbody className="divide-y divide-slate-100">{renderTableBody}</tbody>
                    </table>
                </div>
            </main>
            <div>
                <Label className='mb-1'>{t('note')}</Label>
                <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)} className={`border-gray-300`}/>
            </div>
            <div className="flex justify-end">
                {
                    detailTimekeeping?.timeKeeping?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                    (
                        mode != 'view' &&
                            <button
                                onClick={() => setStatusModalConfirm('resolved')}
                                disabled={resolvedTaskTimeKeeping.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Đóng' : 'Closed'}
                            </button>
                    ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(detailTimekeeping?.timeKeeping?.applicationForm?.requestStatusId) ? (null) : (
                            mode != 'view' && <>
                            <button
                                onClick={() => setStatusModalConfirm('reject')}
                                disabled={approvalTimeKeeping.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-1 px-4 bg-red-600 text-white font-semibold rounded-sm shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Từ chối' : 'Reject'}
                            </button>
                            <button
                                onClick={() => setStatusModalConfirm('approval')}
                                disabled={approvalTimeKeeping.isPending}
                                className="cursor-pointer w-full sm:w-auto py-3 px-5 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-base tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Duyệt đơn' : 'Approval'}
                            </button>
                        </>
                    )
                }
            </div>
            <div className="mb-0">
                <span className="font-bold text-black">
                    {lang === 'vi' ? 'Quy trình' : 'Approval flow'}:
                </span>{' '}
                {detailTimekeeping?.defineAction
                    .map((item: any, idx: number) => (
                        <span key={idx} className="font-bold text-orange-700">
                            ({idx + 1}) {item?.Name ?? item?.UserCode ?? 'HR'}
                            {idx < detailTimekeeping?.defineAction?.length - 1 ? ', ' : ''}
                        </span>
                    ))}
            </div>
            <HistoryApproval historyApplicationForm={detailTimekeeping?.timeKeeping?.applicationForm?.historyApplicationForms}/>
        </div>
    )
}