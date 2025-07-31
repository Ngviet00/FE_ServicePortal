import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next"
import timekeepingApi, { useConfirmTimeKeeping } from "@/api/timeKeepingApi";
import { ConfirmDialogToHR } from "./Components/ConfirmDialogToHR";
import { UpdateTimeKeepingDialog } from "./Components/UpdateTimeKeepingDialog";
import { getDaysInMonth, getDefaultMonth, getDefaultYear, getToday } from "./Components/functions";
import { AttendanceStatus, TimeKeeping, UpdateTimeKeeping, UserTimeKeeping } from "./Components/types";
import { statusColors, statusDefine, statusLabels } from "./Components/constants";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { useDebounce } from "@/lib";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import DateTimePicker from "@/components/ComponentCustom/Flatpickr";

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
    const [openUpdateTimeKeeping, setOpenUpdateTimeKeeping] = useState(false);
    const [selectedData, setSelectedData] = useState<UpdateTimeKeeping | null>(null);
    const [dataAttendances, setDataAttendances] = useState<UserTimeKeeping[]>([])
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [keySearch, setKeySearch] = useState("")
    const debouncedKeySearch = useDebounce(keySearch, 300);
    const [isOpenModalUpdateTimeKeeping, setOpenModalUpdateTimeKeeping] = useState(false);

    const daysInMonth = getDaysInMonth(year, month)
    const daysHeader = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateObj = new Date(year, month - 1, day);
        return {
            dayStr: day.toString().padStart(2, "0"),
            dateObj,
        };
    });
    
    const { isPending, isError, error } = useQuery({
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
            StatusColors: statusColors,
            StatusDefine: statusDefine
        });
    }

    const saveChangeUpdateTimeKeeping = () => {
        if (selectedData?.rowIndex === undefined || selectedData?.colIndex === undefined)
            return;

        const updated = [...dataAttendances];

        const currentItem = updated[selectedData.rowIndex].dataTimeKeeping[selectedData.colIndex];
        const isSunday = currentItem.thu === "CN";
        const isWork = selectedData.currentValue === "X";
        const newResult = isSunday && isWork ? "CN_X" : selectedData.currentValue;

        if (currentItem.result === newResult) {
            setOpenUpdateTimeKeeping(false);
            return;
        }

        updated[selectedData.rowIndex] = {
            ...updated[selectedData.rowIndex],
            dataTimeKeeping: updated[selectedData.rowIndex].dataTimeKeeping.map((item, idx) =>
                idx === selectedData.colIndex
                    ? {
                        ...item,
                        result: newResult,
                        currentBgColor: '#4679FF',
                    }
                    : item
            ),
        };

        setDataAttendances(updated);
        setOpenUpdateTimeKeeping(false);
    }

    const { data: getDeptUserMngTimeKeeping = [] } = useQuery({
        queryKey: ['get-dept-user-mng-time-keeping'],
        queryFn: async () => {
            const res = await timekeepingApi.getDeptUserMngTimeKeeping(user?.userCode ?? "")
            return res.data.data;
        },
    });

    // const { data: getIdOrgUnitByUserCodeAndUnitId = [] } = useQuery({
    //     queryKey: ['get-id-org-unit-by-usercode-and-unit-id'],
    //     queryFn: async () => {
    //         const res = await timekeepingApi.GetIdOrgUnitByUserCodeAndUnitId(user?.userCode ?? "")
    //         return res.data.data;
    //     },
    // });

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const [selectedOption, setSelectedOption] = useState('type_leave');
    const handleChangeOption = (type: string) => {
        setSelectedOption(type)
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
                    {/* <div>
                        <Label className="mb-1">Nhóm</Label>
                        <select className="text-sm border-gray-300 border w-50 h-[30px] rounded-[5px] hover:cursor-pointer" value={team} 
                            onChange={(e) => {
                                setPage(1)
                                setTeam(e.target.value)
                            }}>
                            <option value="" className="text-sm">--Tất cả--</option>
                            {
                                getIdOrgUnitByUserCodeAndUnitId.map((item: {id: number, name: string}, idx: number) => (
                                    <option key={idx} className="text-sm" value={item.id}>{item.name}</option>
                                ))
                            }
                        </select>
                    </div> */}
                    <div>
                        <Label className="mb-1">Bộ phận</Label>
                        <select className="text-sm border-gray-300 border w-50 h-[30px] rounded-[5px] hover:cursor-pointer" value={deptId} 
                            onChange={(e) => {
                                setPage(1)
                                setDeptId(e.target.value)
                            }}>
                            <option value="" className="text-sm">--Tất cả--</option>
                            {
                                getDeptUserMngTimeKeeping.map((item: {id: number, name: string, deptId: number}, idx: number) => (
                                    <option key={idx} className="text-sm" value={item.deptId}>{item.name}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                <div className="font-bold text-xl lg:text-3xl">
                    <span>{month} - {year}</span>
                </div>
                <div>
                    <UpdateTimeKeepingDialog
                        open={openUpdateTimeKeeping}
                        onOpenChange={setOpenUpdateTimeKeeping}
                        selectedData={selectedData}
                        setSelectedData={setSelectedData}
                        onSave={saveChangeUpdateTimeKeeping}
                    />

                    <Button className="mr-1">
                        <Link to="/">Lịch sử chỉnh sửa (0)</Link>
                    </Button>
                    
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
                        <TableHeader className="sticky top-0 bg-gray-300 dark:bg-black z-20">
                            <TableRow className="border-b bg-gray-300 hover:bg-gray-300 dark:bg-black dark:text-white">
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
                            isPending ? (
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
                                dataAttendances?.map((item: UserTimeKeeping, idx: number) => (
                                    <TableRow key={idx} className="border-b dark:border-[#9b9b9b]">
                                        <TableCell className="text-left border-r">{item.nvMaNV}</TableCell>
                                        <TableCell className="text-left border-r">{item.nvHoTen}</TableCell>
                                        <TableCell className="text-left border-r">{item.bpTen}</TableCell>
                                        {
                                            item.dataTimeKeeping.map((data: TimeKeeping, index: number) => {
                                                const result = data.result
                                                let bgColor = ''
                                                let textColor = 'black';
                                                
                                                if (result == '?' && new Date(data.bcNgay) < new Date()) {
                                                    bgColor = '#FF7B7D'
                                                }
                                                else if (result == 'CN_X' || !isNaN(parseFloat(result ?? ''))) {
                                                    bgColor = '#FFFFFF'
                                                }
                                                else if (result == 'SH' || result == 'CN' || result == 'X' || result == '') {
                                                    bgColor = statusColors[result ?? ''] ?? ''
                                                    textColor = result == 'CN' ? 'white' : 'black'
                                                }
                                                else {
                                                    bgColor = '#E1CD00'
                                                }

                                                return (
                                                    <TableCell
                                                        onClick={() => setOpenModalUpdateTimeKeeping(true)}
                                                        // onClick={() => {
                                                        //     setSelectedData({
                                                        //         nvMaNV: item.nvMaNV,
                                                        //         nvHoTen: item.nvHoTen,
                                                        //         bpTen: item.bpTen,
                                                        //         date: data.bcNgay,
                                                        //         currentValue: result,
                                                        //         currentBgColor: bgColor,
                                                        //         rowIndex: idx,
                                                        //         colIndex: index,
                                                        //         thu: data.thu,
                                                        //         vao: data.vao,
                                                        //         ra: data.ra
                                                        //     });
                                                        //     setOpenUpdateTimeKeeping(true);
                                                        // }}
                                                        style={{backgroundColor: data?.currentBgColor ?? bgColor ?? '', color: textColor}} 
                                                        key={index} className={`p-0 min-w-[36px] max-w-[36px] text-center border-r hover:cursor-pointer`}>
                                                        <div className="text-xs">
                                                            {result == 'CN' ? 'CN' : result}
                                                        </div>
                                                    </TableCell>
                                                );
                                            })
                                        }
                                    </TableRow>
                                )))
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
            <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setOpenModalUpdateTimeKeeping(true)}
      >
        Open Modal
      </button>

            <Modal isOpen={isOpenModalUpdateTimeKeeping} onClose={() => setOpenModalUpdateTimeKeeping(false)} className="min-w-[900px] min-h-[700px]">
                <h2 className="text-xl font-semibold mb-2">Cập nhật chấm công</h2>

                <p className="font-bold text-base">Đang chọn: <span className="text-xl text-red-700">2025-05-31 ___ Nguyễn Văn A ___ 22757</span></p>

                <div>
                    <span>Giờ vào:</span> <span>2025-55-55 </span> <br />
                    <span>Giờ ra:</span> <span>2025-55-55 </span> <br />
                </div>

                <Label className="text-[17px] text-blue-600">Chọn loại nghỉ phép</Label>
                <div className="flex mt-0">
                    <div className="mr-5">
                        <input
                            id='type_leave'
                            type="radio" 
                            className="mr-1" 
                            value={selectedOption}
                            checked={selectedOption == 'type_leave'}
                            onChange={() => handleChangeOption('type_leave')}
                        />
                        <label htmlFor="type_leave" className="hover:cursor-pointer">Loại phép</label>
                    </div>
                    <div>
                        <input
                            id='go_late_early'
                            onChange={() => handleChangeOption('go_late_early')}
                            value={selectedOption}
                            checked={selectedOption == 'go_late_early'}
                            type="radio"
                            className="mr-1"
                        />
                        <label htmlFor="go_late_early" className="hover:cursor-pointer">Đi trễ, về sớm</label>
                    </div>
                </div>

                <div>
                            <DateTimePicker
                        // disabled={true}
                        enableTime={true}
                        dateFormat="Y-m-d H:i"
                        initialDateTime={selectedData?.date}
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onChange={(_selectedDates, dateStr, _instance) => {
                            //rhfField.onChange(dateStr);
                        }}
                        className={`dark:bg-[#454545] shadow-xs border p-1 rounded-[5px] hover:cursor-pointer`}
                    />
                </div>
                <div>

                </div>
                <button
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => setOpenModalUpdateTimeKeeping(false)}
                >
                Close
                </button>
            </Modal>
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

