/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"
import timekeepingApi, { useApprovalTimeKeeping, useExportExcelTimeKeeping, useResolvedTaskTimeKeeping } from "@/api/HR/timeKeepingApi";
import { calculateRoundedTime, getDaysInMonth} from "./Components/functions";
import { AttendanceStatus, UpdateTimeKeeping } from "./Components/types";
import { statusColors, statusDefine, statusLabels } from "./Components/constants";
import { StatusApplicationFormEnum, useDebounce } from "@/lib";
import { Button } from "@/components/ui/button";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { useNavigate } from "react-router-dom";
import HistoryApproval from "../Approval/Components/HistoryApproval";
import ModalConfirm from "@/components/ModalConfirm";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

interface ViewApprovalTimeKeepingProps {
    id: string;
    mode?: string
}

export default function ViewTimeKeeping ({ id, mode }: ViewApprovalTimeKeepingProps) {
    const { t } = useTranslation()
    const lang = useTranslation().i18n.language.split('-')[0]
    const {user} = useAuthStore()
    const { t: tCommon } = useTranslation('common')
    const [typePerson, setTypePerson] = useState<string>("")
    const [dataAttendances, setDataAttendances] = useState<UpdateTimeKeeping[]>([])
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [keySearch, setKeySearch] = useState("")
    const [month, setMonth] = useState(0)
    const [year, setYear] = useState(0)
    const debouncedKeySearch = useDebounce(keySearch, 300);
    const navigate = useNavigate()
    const [note, setNote] = useState("")
    const queryClient = useQueryClient()
    const isHasId = !!id;

    const [statusModalConfirm, setStatusModalConfirm] = useState('')

    const { data: formData, isLoading: isFormDataLoading, isError, error } = useQuery({
        queryKey: ['timekeeping', id, page, pageSize, debouncedKeySearch, typePerson],
        queryFn: async () => {
            try {
                const res = await timekeepingApi.getDetailTimeKeeping(id ?? '', {
                    Page: page,
                    PageSize: pageSize,
                    TypePerson: typePerson,
                    KeySearch: debouncedKeySearch
                });
                return res.data.data;
            } catch (error: any) {
                if (error.response?.status === 404) {
                    console.warn('Purchase not found');
                    return null;
                }
                throw error;
            }
        },
        enabled: isHasId,
    });

    useEffect(() => {
        if (formData) {
            setMonth(formData?.timeKeepingInfo?.month)
            setYear(formData?.timeKeepingInfo?.year)
            setTotalPage(formData.timeKeepingData.totalPages)
            setDataAttendances(formData?.timeKeepingData?.data)
        }
    }, [formData])

    const daysInMonth = getDaysInMonth(year, month)
    const daysHeader = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(year, month - 1, day);
        return {
            dayStr: day.toString().padStart(2, "0"),
            dateObj,
        };
    });

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const approvalTimeKeeping = useApprovalTimeKeeping()
    const resolvedTaskTimeKeeping = useResolvedTaskTimeKeeping()
    const handleSaveModalConfirm = async (type: string) => {
        setStatusModalConfirm('')

        const payload = {
            RequestTypeId: formData?.timeKeepingInfo?.applicationForm?.requestTypeId,
            RequestStatusId: formData?.timeKeepingInfo?.applicationForm?.requestStatusId,
            applicationFormId: formData?.timeKeepingInfo?.applicationForm?.id,
            applicationFormCode: formData?.timeKeepingInfo?.applicationForm?.code,
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

        if (formData?.timeKeepingInfo?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned) {
            navigate("/approval/assigned-tasks")
        } else {
            navigate("/approval/pending-approval")
        }   
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] });
    }

    const exportExcelTimeKeeping  = useExportExcelTimeKeeping()
    const handleExportExcelTimeKeeping = async () => {
        await exportExcelTimeKeeping.mutateAsync(id ?? '')
    }
    
    if (isHasId && isFormDataLoading) {
        return <div>{lang == 'vi' ? 'Đang tải' : 'Loading'}...</div>;
    }

    if (!formData) {
        return  <div className='text-red-700 font-semibold'>{lang == 'vi' ? 'Không tìm thấy dữ liệu' : 'Not found data'}</div>;
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">{lang == 'vi' ? 'Chi tiết chấm công' : 'Detail timekeeping'}</h3>
            </div>
            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
            />

            <div className="flex flex-wrap gap-4 items-center mt-3 mb-3 lg:justify-between">
                <div className="flex space-x-4">
                    <div>
                        <Label className="mb-1">{t("mng_time_keeping.usercode")}</Label>
                        <input
                            value={keySearch}
                            onChange={(e) => {
                                setPage(1)
                                setKeySearch(e.target.value)
                            }}
                            type="text" 
                            className="border p-1 rounded-[5px] pl-1 text-sm border-gray-300" 
                            placeholder="Mã nhân viên"
                        />
                    </div>
                    <div>
                        <Label className="mb-1">{lang == 'vi' ? 'Chính thức,thời vụ,..' : 'Type'}</Label>
                        <select className="text-sm border-gray-300 border w-50 h-[30px] rounded-[5px] hover:cursor-pointer" value={typePerson} 
                            onChange={(e) => {
                                setPage(1)
                                setTypePerson(e.target.value)
                            }}>
                            <option value="" className="text-sm">--{lang == 'vi' ? 'Tất cả' : 'All'}--</option>
                            <option key={1} className="text-sm" value={1}>{lang == 'vi' ? `Chính thức` : 'Fulltime'}</option>
                            <option key={2} className="text-sm" value={2}>{lang == 'vi' ? `Thời vụ` : 'Temporary'}</option>
                            <option key={3} className="text-sm" value={3}>{lang == 'vi' ? `Nước ngoài` : 'Foreigner'}</option>
                        </select>
                    </div>
                </div>
                <div className="font-bold text-3xl">
                    {month.toString().padStart(2, "0")}__{year}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {
                        [StatusApplicationFormEnum.Assigned, StatusApplicationFormEnum.Complete].includes(formData?.timeKeepingInfo?.applicationForm?.requestStatusId) && 
                            <Button
                                onClick={handleExportExcelTimeKeeping}
                                disabled={exportExcelTimeKeeping.isPending}
                                className="px-2 py-1 bg-blue-700 text-white rounded-[3px] hover:bg-blue-800 transition-all duration-200 text-sm hover:cursor-pointer mr-2"
                            >
                                {exportExcelTimeKeeping.isPending ? <Spinner/> : lang == 'vi' ? 'Xuất excel' : 'Export excel'}
                            </Button>
                    }
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-x-4 gap-y-2 items-start">
                {
                    Object.entries(statusLabels).map(([key]) => {
                        return (
                            <span className="py-1 flex items-center transition-colors duration-150 ease-in-out group" key={key}>
                                <span className={`text-black font-bold bg-gray-200 w-[37px] h-[20px]dark:text-black text-xs text-center inline-flex items-center justify-center p-[2px] rounded-[3px] mr-1 flex-shrink-0`}>
                                    {statusLabels[key as AttendanceStatus]}
                                </span>
                                <span className="text-xs sm:text-sm flex-grow">
                                    {statusDefine[key as AttendanceStatus]}
                                </span>
                            </span>
                        );
                    })
                }
            </div>
            <div className="mb-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
                    <table className="min-w-[1200px] border-collapse">
                        <thead className="sticky top-0 z-30 bg-gray-50 dark:bg-black">
                            <tr className="border-b bg-[#f3f4f6] dark:bg-black dark:text-white">
                                <th className="w-[130px] text-center border-r p-2">
                                    {t("mng_time_keeping.usercode")}
                                </th>
                                <th className="w-[180px] text-center border-r">
                                    {t("mng_time_keeping.name")}
                                </th>
                                <th className="w-[130px] text-center border-r">
                                    {t("mng_time_keeping.dept")}
                                </th>
                                {daysHeader.map(({ dayStr }) => {
                                    const fullDayStr = `${year}-${String(month).padStart(2, "0")}-${dayStr}`;
                                    const bgSunday = new Date(fullDayStr).getDay() == 0 ? statusColors["CN" as AttendanceStatus] : "";
                                    const colorSunday = new Date(fullDayStr).getDay() == 0 ? "#FFFFFF" : "";

                                    return (
                                        <th
                                            key={dayStr}
                                            style={{ backgroundColor: bgSunday || "", color: colorSunday }}
                                            className="w-[36px] text-center border-r text-sm"
                                            >
                                            {dayStr}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {isFormDataLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index}>
                                    <td className="w-[130px] text-center p-2">
                                        <div className="flex justify-center">
                                            <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                        </div>
                                    </td>
                                    <td className="w-[180px] text-center">
                                        <div className="flex justify-center">
                                            <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                        </div>
                                    </td>
                                    <td className="w-[130px] text-center">
                                        <div className="flex justify-center">
                                            <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                        </div>
                                    </td>
                                    {daysHeader.map(({ dayStr }) => (
                                        <td key={dayStr} className="w-[36px] text-center">
                                            <div className="flex justify-center">
                                            <Skeleton className="h-3 w-[17px] bg-gray-300" />
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                                ))
                            ) : isError || dataAttendances.length == 0 ? (
                                <tr>
                                    <td
                                        colSpan={daysInMonth + 3}
                                        className={`align-middle p-2 bg-gray-50 dark:bg-[#1a1a1a] px-4 py-2 text-center font-bold text-red-700`}
                                    >
                                        {error?.message ?? tCommon("no_results")}
                                    </td>
                                </tr>
                            ) : (
                                dataAttendances?.map((item: UpdateTimeKeeping, idx: number) => (
                                    <tr key={idx} className="border-b dark:border-[#9b9b9b]">
                                        <td className="text-left border-r p-2 pl-3 text-sm w-[130px]">
                                            {item.UserCode}
                                        </td>
                                        <td className="text-left border-r pl-2 text-sm w-[180px]">{item.Name}</td>
                                        <td className="text-left border-r pl-2 text-sm w-[130px]">
                                            {item.Department}
                                        </td>
                                        {daysHeader.map(({ dayStr }) => {
                                            let bgColor = "#FFFFFF";
                                            let textColor = "#000000";
                                            const dayNumber = parseInt(dayStr, 10);

                                            let result = (item as any)[`ATT${dayNumber}`]?.toString() || "";
                                            const den = (item as any)[`Den${dayNumber}`]?.toString() || "";
                                            const ve = (item as any)[`Ve${dayNumber}`]?.toString() || "";
                                            const wh = (item as any)[`WH${dayNumber}`]?.toString() || "";
                                            const ot = (item as any)[`OT${dayNumber}`]?.toString() || "";
                                            const fullDate = `${year}-${month.toString().padStart(2, "0")}-${dayStr}`;
                                            const isSunday = new Date(fullDate).getDay() === 0;

                                            if (result == "X") {
                                                if (isSunday) {
                                                    result = "CN_X";
                                                } else if (parseFloat(wh) == 7 || parseFloat(wh) == 8) {
                                                    result = "X";
                                                } else if (parseFloat(wh) < 8) {
                                                    const calculateTime = calculateRoundedTime(8 - parseFloat(wh));
                                                    result = calculateTime == "1" ? "X" : calculateTime;
                                                }
                                            } else if (result == "SH") {
                                                bgColor = "#3AFD13";
                                            } else if (result == "CN") {
                                                if (den != "" && ve != "" && (parseFloat(wh) != 0 || parseFloat(ot) != 0)) {
                                                    result = "CN_X";
                                                    bgColor = "#FFFFFF";
                                                    textColor = "#000000";
                                                } else {
                                                    bgColor = "#858585";
                                                }
                                            } else if (result == "ABS" || result == "MISS") {
                                                bgColor = "#FD5C5E";
                                            } else if (result != "X") {
                                                bgColor = "#ffe378";
                                            }

                                            return (
                                                <td
                                                    key={dayStr}
                                                    style={{ backgroundColor: bgColor, color: textColor }}
                                                    className="p-0 min-w-[36px] max-w-[36px] text-center border-r hover:cursor-pointer"
                                                >
                                                    <div className={`flex justify-center text-xs ${result.includes(',') ? 'flex-col text-[9px]' : ''}`}>
                                                        {
                                                            result.includes(',') ? result.split(",").map((x: string, i: number) => <span key={i}>{x}</span>) : result
                                                        }
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                dataAttendances.length > 0 ? (<PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
             <div>
                <Label className='mb-1'>{t('note')}</Label>
                <Textarea placeholder='Note' value={note} onChange={(e) => setNote(e.target.value)} className={`border-gray-300`}/>
            </div>
            <div className="flex justify-end">
                {
                    formData?.timeKeepingInfo?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Assigned ?
                    (
                        mode != 'view' &&
                            <button
                                onClick={() => setStatusModalConfirm('resolved')}
                                disabled={resolvedTaskTimeKeeping.isPending}
                                className="mr-2 cursor-pointer w-full sm:w-auto py-3 px-4 bg-blue-600 text-white font-semibold rounded-sm shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm tracking-wide uppercase disabled:bg-gray-400"
                            >
                                {lang == 'vi' ? 'Đóng' : 'Closed'}
                            </button>
                    ) : [StatusApplicationFormEnum.Complete, StatusApplicationFormEnum.Reject].includes(formData?.timeKeepingInfo?.applicationForm?.requestStatusId) ? (null) : (
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
                {formData?.defineAction
                    .map((item: any, idx: number) => (
                        <span key={idx} className="font-bold text-orange-700">
                            ({idx + 1}) {item?.Name ?? item?.UserCode ?? 'HR'}
                            {idx < formData.defineAction?.length - 1 ? ', ' : ''}
                        </span>
                    ))}
            </div>
            <HistoryApproval historyApplicationForm={formData?.timeKeepingInfo?.applicationForm?.historyApplicationForms}/>
        </div>
    )
}

