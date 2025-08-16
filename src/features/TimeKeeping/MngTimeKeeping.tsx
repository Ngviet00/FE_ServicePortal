/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuthStore } from "@/store/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next"
import timekeepingApi, { useConfirmTimeKeeping, useEditTimeAttendanceHistory } from "@/api/timeKeepingApi";
import { ConfirmDialogToHR } from "./Components/ConfirmDialogToHR";
import { calculateRoundedTime, getDaysInMonth, getDefaultMonth, getDefaultYear, getToday } from "./Components/functions";
import { AttendanceStatus, UpdateTimeKeeping } from "./Components/types";
import { statusColors, statusDefine, statusLabels } from "./Components/constants";
import { useDebounce } from "@/lib";
import { Button } from "@/components/ui/button";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import ModalUpdateTimeKeeping from "./Components/ModalUpdateTimeKeeping";
import ModalHistoryEditTimeKeeping from "./Components/ModalListHistoryEditTimeKeeping";
import orgUnitApi from "@/api/orgUnitApi";

export default function MngTimekeeping () {
    const { t } = useTranslation()
    const {user} = useAuthStore()

    const today = getToday()
    const defaultMonth = getDefaultMonth(today)
    const defaultYear = getDefaultYear(today)
    const [month, setMonth] = useState(defaultMonth)
    const [year, setYear] = useState(defaultYear)
    const [team] = useState<string>("")
    const [deptId, setDeptId] = useState<string>("")
    const confirmTimeKeeping = useConfirmTimeKeeping();
    const [selectedData, setSelectedData] = useState<UpdateTimeKeeping | null>(null);
    const [dataAttendances, setDataAttendances] = useState<UpdateTimeKeeping[]>([])
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [keySearch, setKeySearch] = useState("")
    const debouncedKeySearch = useDebounce(keySearch, 300);
    const [isOpenModalUpdateTimeKeeping, setOpenModalUpdateTimeKeeping] = useState(false);
    const [isOpenModalListHistoryEditTimeKeeping, setOpenModalListHistoryEditTimeKeeping] = useState(false);
    const queryClient = useQueryClient();
    const [countHistoryEditTimeKeepingNotSendHR, setCountHistoryEditTimeKeepingNotSendHR] = useState(0)

    const daysInMonth = getDaysInMonth(year, month)
    const daysHeader = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(year, month - 1, day);
        return {
            dayStr: day.toString().padStart(2, "0"),
            dateObj,
        };
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-departments'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data
        },
    });
    
    useQuery({
        queryKey: ['count-history-edit-timekeeping-not-send-hr'],
        queryFn: async () => {
            const res = await timekeepingApi.CountHistoryEditTimeKeepingNotSendHR(user?.userCode ?? '')
            setCountHistoryEditTimeKeepingNotSendHR(res.data.data)
            return res.data.data
        }
    });

    const { isLoading, isError, error } = useQuery({
        queryKey: ['management-timekeeping', year, month, page, pageSize, debouncedKeySearch, deptId],
        queryFn: async () => {
            const res = await timekeepingApi.getMngTimeKeeping({
                UserCode: user?.userCode ?? "",
                Year: year,
                Month: month,
                page: page,
                pageSize: pageSize,
                keySearch: debouncedKeySearch,
                team: team ? Number(team) : null,
                deptId: deptId ? Number(deptId) : null,
            })
            setDataAttendances(res.data.data)
            setTotalPage(res.data.total_pages)
            return res.data.data
        },
        enabled: !!year && !!month && !!user?.userCode
    });

    const handleSendToHR = async () => {
        await confirmTimeKeeping.mutateAsync({
            UserCode: user?.userCode ?? "",
            Year: year,
            Month: month,
            UserName: user?.userName ?? ""
        });
        setCountHistoryEditTimeKeepingNotSendHR(0)
    }

    const editTimeAttendanceHistory = useEditTimeAttendanceHistory();
    const saveChangeUpdateTimeKeeping = async (finalResult: string, currentUserCode: string, currentDate: string) => {
        if (selectedData?.Result === finalResult) {
            setOpenModalUpdateTimeKeeping(false);
            return;
        }
        await editTimeAttendanceHistory.mutateAsync({
            Datetime: currentDate,
            OldValue: selectedData?.Result,
            CurrentValue: finalResult,
            UserCode: currentUserCode,
            UserCodeUpdate: user?.userCode,
            UpdatedBy: user?.userName ?? ''
        });

        queryClient.invalidateQueries({ queryKey: ['management-timekeeping'] });
        queryClient.invalidateQueries({ queryKey: ['count-history-edit-timekeeping-not-send-hr'] });
        setOpenModalUpdateTimeKeeping(false);
    }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">{t('mng_time_keeping.mng_time_keeping')}</h3>
            </div>
            <div className="flex flex-wrap gap-4 items-center mt-3 mb-3 lg:justify-between">
                <div className="flex space-x-4">
                    <div>
                        <Label className="mb-1">{t('mng_time_keeping.month')}</Label>
                        <select className="border border-gray-300 w-30 h-[30px] rounded-[5px] hover:cursor-pointer" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i+1} value={i+1}>{i+1}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label className="mb-1">{t('mng_time_keeping.year')}</Label>
                        <select className="border border-gray-300 w-30 h-[30px] rounded-[5px] hover:cursor-pointer" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                            <option value={defaultYear - 1}>{defaultYear - 1}</option>
                            <option value={defaultYear}>{defaultYear}</option>
                            <option value={defaultYear + 1}>{defaultYear + 1}</option>
                        </select>
                    </div>
                    <div>
                        <Label className="mb-1">Mã nhân viên</Label>
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
                        <Label className="mb-1">Bộ phận</Label>
                        <select className="text-sm border-gray-300 border w-50 h-[30px] rounded-[5px] hover:cursor-pointer" value={deptId} 
                            onChange={(e) => {
                                setPage(1)
                                setDeptId(e.target.value)
                            }}>
                            <option value="" className="text-sm">--Tất cả--</option>
                            {
                                departments.map((item: {id: number, name: string}, idx: number) => (
                                    <option key={idx} className="text-sm" value={item.id}>{item.name}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className="font-bold text-xl lg:text-3xl">
                    <span>{month} - {year}</span>
                </div>
                <div>
                    <Button className="mr-1 bg-red-700 hover:bg-red-800 hover:cursor-pointer" onClick={() => setOpenModalListHistoryEditTimeKeeping(true)}>
                        Lịch sử chỉnh sửa ({countHistoryEditTimeKeepingNotSendHR ?? 0})
                    </Button>
                    {
                        dataAttendances.length > 0 ? (
                            <ConfirmDialogToHR 
                                    title={t('mng_time_keeping.want_to_continue')}
                                    description={t('mng_time_keeping.description')}
                                    onConfirm={handleSendToHR}
                                    isPending={confirmTimeKeeping.isPending}
                                    confirmText={t('mng_time_keeping.continue')}
                                    cancelText={t('mng_time_keeping.cancel')}
                                >
                                <button disabled={confirmTimeKeeping.isPending} className={`${confirmTimeKeeping.isPending ? 'opacity-70' : ''}hover:cursor-pointer px-3 py-2 text-white rounded-[7px] text-[14px] font-semibold bg-blue-600 hover:bg-blue-800`}>
                                    {t('mng_time_keeping.btn_confirm_hr')}
                                </button>
                            </ConfirmDialogToHR>
                        ) : (
                            <></>
                        )
                    }
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-x-4 gap-y-2 items-start">
                {
                    Object.entries(statusLabels).map(([key]) => {
                        return (
                            <span className="p-1 flex items-center transition-colors duration-150 ease-in-out group" key={key}>
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
            
            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-gray-50 dark:bg-black z-20">
                            <TableRow className="border-b bg-[#f3f4f6] dark:bg-black dark:text-white">
                                <TableHead className="w-[0px] text-center border-r text-black dark:text-white">{t('mng_time_keeping.usercode')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r text-black dark:text-white">{t('mng_time_keeping.name')}</TableHead>
                                <TableHead className="w-[100px] text-center border-r text-black dark:text-white">{t('mng_time_keeping.dept')}</TableHead>
                                {
                                    daysHeader.map(({ dayStr }) => {
                                        const fullDayStr = `${year}-${String(month).padStart(2, "0")}-${dayStr}`;
                                        const bgSunday = new Date(fullDayStr).getDay() == 0 ? statusColors['CN' as AttendanceStatus] : ''
                                        const colorSunday = new Date(fullDayStr).getDay() == 0 ? '#FFFFFF' : ''

                                        return (
                                            <TableHead
                                                key={dayStr}
                                                style={{ backgroundColor: bgSunday || '', color: colorSunday}}
                                                className={`w-[5px] dark:text-white text-center text-black border-r`}
                                            >
                                                {dayStr}
                                            </TableHead>
                                        )
                                    })
                                }
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                            isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[0px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[100px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[100px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></TableCell>
                                        {
                                            daysHeader.map(({ dayStr }) => (
                                                <TableCell key={dayStr} className="w-[100px] text-center"><div className="flex justify-center"><Skeleton className="h-3 w-[17px] bg-gray-300" /></div></TableCell>
                                            ))
                                        }
                                    </TableRow>
                                ))
                            ) : isError || dataAttendances?.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={daysInMonth + 3}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) :
                            (
                                dataAttendances?.map((item: UpdateTimeKeeping, idx: number) => (
                                    <TableRow key={idx} className="border-b dark:border-[#9b9b9b]">
                                        <TableCell className="text-left border-r">{item.UserCode}</TableCell>
                                        <TableCell className="text-left border-r">{item.Name}</TableCell>
                                        <TableCell className="text-left border-r">{item.Department}</TableCell>
                                        {
                                            daysHeader.map(({ dayStr }, colIdx: number) => {
                                                let bgColor = '#FFFFFF'
                                                let textColor = '#000000'
                                                const dayNumber = parseInt(dayStr, 10);
                                                 
                                                let result = (item as any)[`ATT${dayNumber}`]?.toString() || '';
                                                const den = (item as any)[`Den${dayNumber}`]?.toString() || '';
                                                const ve = (item as any)[`Ve${dayNumber}`]?.toString() || ''
                                                const wh = (item as any)[`WH${dayNumber}`]?.toString() || '';
                                                const ot = (item as any)[`OT${dayNumber}`]?.toString() || '';
                                                const fullDate = `${year}-${month.toString().padStart(2, '0')}-${dayStr}`
                                                const isSunday = new Date(fullDate).getDay() === 0;
                                                
                                                if (result == 'X') {
                                                    if (isSunday) {
                                                        result = 'CN_X'
                                                    }
                                                    else if (parseFloat(wh) == 7 || parseFloat(wh) == 8) {
                                                        result = 'X'
                                                    }
                                                    else if (parseFloat(wh) < 8) {
                                                        const calculateTime = calculateRoundedTime(8 - parseFloat(wh))
                                                        result = calculateTime == '1' ? 'X' : calculateTime 
                                                    }
                                                }
                                                else if (result == 'SH') {
                                                    bgColor = '#3AFD13'
                                                }
                                                else if (result == 'CN') {
                                                    if (den != '' && ve != '' && (parseFloat(wh) != 0 || parseFloat(ot) != 0)) {
                                                        result = 'CN_X'
                                                        bgColor = '#FFFFFF'
                                                        textColor = '#000000'
                                                    }
                                                    else {
                                                        bgColor = '#858585'
                                                    }
                                                }
                                                else if (result == 'ABS' || result == 'MISS') {
                                                    bgColor = '#FD5C5E'
                                                }
                                                else if (result != 'X') {
                                                    bgColor = '#ffe378'
                                                }
                                                
                                                return (
                                                    <TableCell
                                                        onClick={() => {
                                                            const invalidResults = ['X', 'CN_X', 'NM'];
                                                            if (!invalidResults.includes(result)) {
                                                                setSelectedData({
                                                                    Name: item.Name,
                                                                    UserCode: item.UserCode,
                                                                    CurrentDate: fullDate,
                                                                    Result: result,
                                                                    Den: den,
                                                                    Ve: ve,
                                                                    RowIndex: idx,
                                                                    ColIndex: colIdx
                                                                })
                                                                setOpenModalUpdateTimeKeeping(true)
                                                            }
                                                        }}
                                                        key={dayStr}
                                                        style={{backgroundColor: bgColor, color: textColor}}  
                                                        className={`p-0 min-w-[36px] max-w-[36px] text-center border-r hover:cursor-pointer`}
                                                    >
                                                        <div className="flex justify-center text-xs">
                                                            {result}
                                                        </div>
                                                    </TableCell>
                                                )
                                            })
                                        }
                                    </TableRow>
                                )))
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>

            <ModalHistoryEditTimeKeeping
                isOpen={isOpenModalListHistoryEditTimeKeeping}
                onClose={() => setOpenModalListHistoryEditTimeKeeping(false)}
            />

            <ModalUpdateTimeKeeping
                isOpen={isOpenModalUpdateTimeKeeping}
                onClose={() => setOpenModalUpdateTimeKeeping(false)}
                selectedData={selectedData}
                onSave={saveChangeUpdateTimeKeeping}
            />
            {
                dataAttendances.length > 0 ? (<PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
        </div>
    )
}

