import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next"
import timekeepingApi, { useConfirmTimeKeeping } from "@/api/timeKeepingApi";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialogToHR } from "./Components/ConfirmDialogToHR";
import { UpdateTimeKeepingDialog } from "./Components/UpdateTimeKeepingDialog";
import { getDaysInMonth, getDefaultMonth, getDefaultYear, getToday } from "./Components/functions";
import { AttendanceStatus, TimeKeeping, UpdateTimeKeeping, UserTimeKeeping } from "./Components/types";
import { statusColors, statusDefine, statusLabels } from "./Components/constants";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { useDebounce } from "@/lib";

export default function MngTimekeeping () {
    const { t } = useTranslation()
    const {user} = useAuthStore()

    const today = getToday()
    const defaultMonth = getDefaultMonth(today)
    const defaultYear = getDefaultYear(today)
    const [month, setMonth] = useState(defaultMonth)
    const [year, setYear] = useState(defaultYear)
    const confirmTimeKeeping = useConfirmTimeKeeping();
    const [openUpdateTimeKeeping, setOpenUpdateTimeKeeping] = useState(false);
    const [selectedData, setSelectedData] = useState<UpdateTimeKeeping | null>(null);
    const [dataAttendances, setDataAttendances] = useState<UserTimeKeeping[]>([])
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [keySearch, setKeySearch] = useState("")
    const debouncedKeySearch = useDebounce(keySearch, 300);

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
        queryKey: ['management-timekeeping', year, month, page, pageSize, debouncedKeySearch],
        queryFn: async () => {
            const res = await timekeepingApi.getMngTimeKeeping({
                UserCode: user?.userCode ?? "",
                Year: year,
                Month: month,
                page: page,
                pageSize: pageSize,
                keySearch: debouncedKeySearch
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

        updated[selectedData.rowIndex] = {
            ...updated[selectedData.rowIndex],
            dataTimeKeeping: updated[selectedData.rowIndex].dataTimeKeeping.map((item, idx) =>
            idx === selectedData.colIndex
                ? {
                    ...item,
                    result: selectedData.currentValue,
                    
                }
                : item
            ),
        };

        setDataAttendances(updated);
        setOpenUpdateTimeKeeping(false);
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
            <div className="flex flex-wrap gap-4 items-center mt-7 mb-3 lg:justify-between">
                <div className="flex space-x-4">
                    <div>
                        <Label className="mb-1">{t('mng_time_keeping.month')}</Label>
                        <select className="border  w-30 h-[30px] rounded-[5px] hover:cursor-pointer" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i+1} value={i+1}>{i+1}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label className="mb-1">{t('mng_time_keeping.year')}</Label>
                        <select className="border w-30 h-[30px] rounded-[5px] hover:cursor-pointer" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                            <option value={defaultYear - 1}>{defaultYear - 1}</option>
                            <option value={defaultYear}>{defaultYear}</option>
                            <option value={defaultYear + 1}>{defaultYear + 1}</option>
                        </select>
                    </div>
                    <div>
                        <Label className="mb-1">Tìm kiếm</Label>
                        <input
                            value={keySearch}
                            onChange={(e) => setKeySearch(e.target.value)}
                            type="text" 
                            className="border p-1 rounded-[5px] pl-1 text-sm border-gray-300" 
                            placeholder="Tìm kiếm theo mã, tên"
                        />
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

                    {/* <Button className="mr-1 hover:cursor-pointer">Export Excel</Button> */}
                    <ConfirmDialogToHR 
                            title={t('mng_time_keeping.want_to_continue')}
                            description={t('mng_time_keeping.description')}
                            onConfirm={handleSendToHR}
                            isPending={confirmTimeKeeping.isPending}
                            confirmText={t('mng_time_keeping.continue')}
                            cancelText={t('mng_time_keeping.cancel')}
                        >
                        <button className="hover:cursor-pointer px-3 py-2 text-white rounded-[7px] text-[14px] font-semibold bg-blue-600 hover:bg-blue-800">
                            {confirmTimeKeeping.isPending ? <Spinner className="text-white" /> : t('mng_time_keeping.btn_confirm_hr')}
                        </button>
                    </ConfirmDialogToHR>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-2 items-start">
                {
                    Object.entries(statusLabels).map(([key]) => {
                        return (
                            <span className="p-1 flex items-center transition-colors duration-150 ease-in-out group" key={key}>
                                <span
                                    style={{ backgroundColor: statusColors[key as AttendanceStatus] || '' }}
                                    className={`
                                        ${['X', 'SH'].includes(statusLabels[key as AttendanceStatus]) ? 'text-black' : 'text-white'}
                                        w-[37px] h-[20px]
                                        dark:text-black text-xs font-semibold text-center
                                        inline-flex items-center justify-center
                                        p-[2px] rounded-[3px] mr-1 flex-shrink-0
                                        bg-[var(--legend-bg-color)]
                                        group-hover:bg-gray-200 
                                    `}
                                >
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
                        <TableHeader>
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
                                Array.from({ length: 1 }).map((_, index) => (
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
                                        <TableCell className="text-center border-r">{item.nvMaNV}</TableCell>
                                        <TableCell className="text-center border-r">{item.nvHoTen}</TableCell>
                                        <TableCell className="text-center border-r">{item.bpTen}</TableCell>
                                        {
                                            item.dataTimeKeeping.map((data: TimeKeeping, index: number) => {
                                                const result = data.result
                                                let bgColor = ''
                                                let textColor = 'black';

                                                if (result == 'CN-X' || !isNaN(parseFloat(result ?? ''))) {
                                                    bgColor = '#FFFFFF'
                                                } 
                                                else {
                                                    bgColor = statusColors[result ?? ''] ?? ''
                                                }

                                                if (result == 'CN') {
                                                    textColor = 'white'
                                                }

                                                if (result == '?' && new Date(data.bcNgay) < new Date()) {
                                                    bgColor = '#FF7B7D'
                                                }

                                                return (
                                                    <TableCell
                                                        onClick={() => {
                                                            setSelectedData({
                                                                nvMaNV: item.nvMaNV,
                                                                nvHoTen: item.nvHoTen,
                                                                bpTen: item.bpTen,
                                                                date: data.bcNgay,
                                                                currentValue: result,
                                                                currentBgColor: bgColor,
                                                                rowIndex: idx,
                                                                colIndex: index
                                                            });
                                                            setOpenUpdateTimeKeeping(true);
                                                        }}
                                                        style={{backgroundColor: bgColor ?? '', color: textColor}} key={index} className={`p-0 w-[100px] text-center border-r hover:cursor-pointer`}>
                                                        <div className="flex justify-center">
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
// import { Label } from "@/components/ui/label";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { useAuthStore } from "@/store/authStore";
// import { useQuery } from "@tanstack/react-query";
// import { useState, useRef, useMemo, useEffect } from "react"; // Add useRef, useMemo, useEffect
// import { useTranslation } from "react-i18next"
// import timekeepingApi, { useConfirmTimeKeeping } from "@/api/timeKeepingApi";
// import { Spinner } from "@/components/ui/spinner";
// import { ConfirmDialogToHR } from "./Components/ConfirmDialogToHR";
// import { UpdateTimeKeepingDialog } from "./Components/UpdateTimeKeepingDialog";
// import { getDaysInMonth, getDefaultMonth, getDefaultYear, getToday } from "./Components/functions";
// import { AttendanceStatus, TimeKeeping, UpdateTimeKeeping, UserTimeKeeping } from "./Components/types";
// import { statusColors, statusDefine, statusLabels } from "./Components/constants";
// import PaginationControl from "@/components/PaginationControl/PaginationControl";

// // Import useVirtual from tanstack/react-virtual
// import { useVirtualizer } from '@tanstack/react-virtual';

// export default function MngTimekeeping() {
//     const { t } = useTranslation();
//     const { user } = useAuthStore();

//     const today = getToday();
//     const defaultMonth = getDefaultMonth(today);
//     const defaultYear = getDefaultYear(today);
//     const [month, setMonth] = useState(defaultMonth);
//     const [year, setYear] = useState(defaultYear);
//     const confirmTimeKeeping = useConfirmTimeKeeping();
//     const [openUpdateTimeKeeping, setOpenUpdateTimeKeeping] = useState(false);
//     const [selectedData, setSelectedData] = useState<UpdateTimeKeeping | null>(null);
//     const [dataAttendances, setDataAttendances] = useState<UserTimeKeeping[]>([]);
//     const [totalPage, setTotalPage] = useState(0);
//     const [page, setPage] = useState(1);
//     const [pageSize, setPageSize] = useState(20);

//     const daysInMonth = getDaysInMonth(year, month);
//     const daysHeader = Array.from({ length: daysInMonth }, (_, i) => {
//         const day = i + 1;
//         const dateObj = new Date(year, month - 1, day);
//         return {
//             dayStr: day.toString().padStart(2, "0"),
//             dateObj,
//         };
//     });

//     // --- Virtualization setup ---
//     const parentRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container
//     const rowVirtualizer = useVirtualizer({
//         count: dataAttendances.length, // Total number of rows
//         getScrollElement: () => parentRef.current, // The element that scrolls
//         estimateSize: () => 45, // Estimated height of each row (adjust as needed for your TableRow height)
//         overscan: 5, // Render a few extra items outside the viewport for smoother scrolling
//     });

//     const virtualRows = rowVirtualizer.getVirtualItems();

//     // To handle dynamic heights if needed, use useVirtualizer with `measureElement`
//     // const rowVirtualizer = useVirtualizer({
//     //     count: dataAttendances.length,
//     //     getScrollElement: () => parentRef.current,
//     //     estimateSize: () => 45, // Provide an estimate
//     //     measureElement: element => element.getBoundingClientRect().height, // Measure actual height
//     //     overscan: 5,
//     // });
//     // --- End Virtualization setup ---

//     const { isPending, isError, error, refetch } = useQuery({ // Add refetch
//         queryKey: ['management-timekeeping', year, month, page, pageSize],
//         queryFn: async () => {
//             const res = await timekeepingApi.getMngTimeKeeping({
//                 UserCode: user?.userCode ?? "",
//                 Year: year,
//                 Month: month,
//                 page: page,
//                 pageSize: pageSize
//             });
//             setDataAttendances(res.data.data);
//             setTotalPage(res.data.total_pages);
//             return res.data.data;
//         },
//         enabled: !!year && !!month && !!user?.userCode
//     });

//     const handleSendToHR = async () => {
//         await confirmTimeKeeping.mutateAsync({
//             UserCode: user?.userCode ?? "",
//             Year: year,
//             Month: month,
//             StatusColors: statusColors,
//             StatusDefine: statusDefine
//         }, {
//             onSuccess: () => {
//                 // Optionally refetch data after successful confirmation if status changes
//                 refetch();
//             }
//         });
//     };

//     const saveChangeUpdateTimeKeeping = () => {
//         if (selectedData?.rowIndex === undefined || selectedData?.colIndex === undefined)
//             return;

//         // Perform the local update
//         const updated = [...dataAttendances];
//         updated[selectedData.rowIndex] = {
//             ...updated[selectedData.rowIndex],
//             dataTimeKeeping: updated[selectedData.rowIndex].dataTimeKeeping.map((item, idx) =>
//                 idx === selectedData.colIndex
//                     ? {
//                         ...item,
//                         result: selectedData.currentValue,
//                     }
//                     : item
//             ),
//         };
//         setDataAttendances(updated);

//         // Close the dialog
//         setOpenUpdateTimeKeeping(false);

//         // Optionally, if you have an API to update a single cell, you'd call it here
//         // For example:
//         // updateTimekeepingCell.mutate({
//         //    UserCode: item.nvMaNV,
//         //    Date: data.bcNgay,
//         //    NewStatus: selectedData.currentValue
//         // });
//     };

//     function setCurrentPage(newPage: number): void { // Renamed from 'page' to 'newPage' for clarity
//         setPage(newPage);
//         // Important: When page changes, scroll to top of virtualized list
//         parentRef.current?.scrollTo({ top: 0 });
//     }

//     function handlePageSizeChange(size: number): void {
//         setPage(1); // Reset to first page when page size changes
//         setPageSize(size);
//         parentRef.current?.scrollTo({ top: 0 }); // Scroll to top
//     }

//     // Adjust TableCell for skeletons based on virtualized rows
//     const skeletonColumnCount = daysInMonth + 3; // NvMaNV, NvHoTen, BpTen + days

//     return (
//         <div className="p-4 pl-1 pt-0 space-y-4">
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
//                 <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">{t('mng_time_keeping.mng_time_keeping')}</h3>
//             </div>
//             <div className="flex flex-wrap gap-4 items-center mt-7 mb-3 lg:justify-between">
//                 <div className="flex space-x-4">
//                     <div>
//                         <Label className="mb-1">{t('mng_time_keeping.month')}</Label>
//                         <select className="border w-30 h-[30px] rounded-[5px] hover:cursor-pointer" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
//                             {Array.from({ length: 12 }, (_, i) => (
//                                 <option key={i + 1} value={i + 1}>{i + 1}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <Label className="mb-1">{t('mng_time_keeping.year')}</Label>
//                         <select className="border w-30 h-[30px] rounded-[5px] hover:cursor-pointer" value={year} onChange={(e) => setYear(Number(e.target.value))}>
//                             <option value={defaultYear - 1}>{defaultYear - 1}</option>
//                             <option value={defaultYear}>{defaultYear}</option>
//                             <option value={defaultYear + 1}>{defaultYear + 1}</option>
//                         </select>
//                     </div>
//                 </div>
//                 <div className="font-bold text-xl lg:text-3xl">
//                     <span>{month} - {year}</span>
//                 </div>
//                 <div>
//                     <UpdateTimeKeepingDialog
//                         open={openUpdateTimeKeeping}
//                         onOpenChange={setOpenUpdateTimeKeeping}
//                         selectedData={selectedData}
//                         setSelectedData={setSelectedData}
//                         onSave={saveChangeUpdateTimeKeeping}
//                     />

//                     <ConfirmDialogToHR
//                         title={t('mng_time_keeping.want_to_continue')}
//                         description={t('mng_time_keeping.description')}
//                         onConfirm={handleSendToHR}
//                         isPending={confirmTimeKeeping.isPending}
//                         confirmText={t('mng_time_keeping.continue')}
//                         cancelText={t('mng_time_keeping.cancel')}
//                     >
//                         <button className="hover:cursor-pointer px-3 py-2 text-white rounded-[7px] text-[14px] font-semibold bg-blue-600 hover:bg-blue-800">
//                             {confirmTimeKeeping.isPending ? <Spinner className="text-white" /> : t('mng_time_keeping.btn_confirm_hr')}
//                         </button>
//                     </ConfirmDialogToHR>
//                 </div>
//             </div>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-4 gap-y-2 items-start">
//                 {
//                     Object.entries(statusLabels).map(([key]) => {
//                         return (
//                             <span className="p-1 flex items-center transition-colors duration-150 ease-in-out group" key={key}>
//                                 <span
//                                     style={{ backgroundColor: statusColors[key as AttendanceStatus] || '' }}
//                                     className={`
//                                         ${['X', 'SH'].includes(statusLabels[key as AttendanceStatus]) ? 'text-black' : 'text-white'}
//                                         w-[37px] h-[20px]
//                                         dark:text-black text-xs font-semibold text-center
//                                         inline-flex items-center justify-center
//                                         p-[2px] rounded-[3px] mr-1 flex-shrink-0
//                                         bg-[var(--legend-bg-color)]
//                                         group-hover:bg-gray-200 
//                                     `}
//                                 >
//                                     {statusLabels[key as AttendanceStatus]}
//                                 </span>
//                                 <span className="text-xs sm:text-sm flex-grow">
//                                     {statusDefine[key as AttendanceStatus]}
//                                 </span>
//                             </span>
//                         );
//                     })
//                 }
//             </div>

//             <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
//                 {/* Outer container for scrolling, must have a defined height */}
//                 <div ref={parentRef} style={{
//                     height: `400px`, // Define a fixed height for the scrollable area
//                     overflow: 'auto', // Enable scrolling
//                 }}>
//                     <div style={{
//                         height: `${rowVirtualizer.getTotalSize()}px`, // Total height of all virtualized rows
//                         width: '100%',
//                         position: 'relative',
//                     }}>
//                         <Table>
//                             <TableHeader className="sticky top-0 z-10 bg-gray-300 dark:bg-black"> {/* Make header sticky */}
//                                 <TableRow className="border-b bg-gray-300 hover:bg-gray-300 dark:bg-black dark:text-white">
//                                     <TableHead className="w-[0px] text-center border-r text-black dark:text-white">{t('mng_time_keeping.usercode')}</TableHead>
//                                     <TableHead className="w-[100px] text-center border-r text-black dark:text-white">{t('mng_time_keeping.name')}</TableHead>
//                                     <TableHead className="w-[100px] text-center border-r text-black dark:text-white">{t('mng_time_keeping.dept')}</TableHead>
//                                     {
//                                         daysHeader.map(({ dayStr }) => {
//                                             const fullDayStr = `${year}-${String(month).padStart(2, "0")}-${dayStr}`;
//                                             const bgSunday = new Date(fullDayStr).getDay() === 0 ? statusColors['CN' as AttendanceStatus] : '';
//                                             const colorSunday = new Date(fullDayStr).getDay() === 0 ? '#FFFFFF' : '';

//                                             return (
//                                                 <TableHead
//                                                     key={dayStr}
//                                                     style={{ backgroundColor: bgSunday || '', color: colorSunday }}
//                                                     className={`w-[5px] dark:text-white text-center text-black border-r`}
//                                                 >
//                                                     {dayStr}
//                                                 </TableHead>
//                                             );
//                                         })
//                                     }
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody style={{
//                                 height: `${rowVirtualizer.getTotalSize()}px`, // This should be the height of the scrollable content
//                                 position: 'relative',
//                             }}>
//                                 {isPending ? (
//                                     // Skeletons for pending state (adjust count and style as needed)
//                                     Array.from({ length: pageSize }).map((_, rowIndex) => (
//                                         <TableRow key={`skeleton-${rowIndex}`}>
//                                             <TableCell className="text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></TableCell>
//                                             <TableCell className="text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></TableCell>
//                                             <TableCell className="text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></TableCell>
//                                             {
//                                                 daysHeader.map(({ dayStr }) => (
//                                                     <TableCell key={dayStr} className="w-[100px] text-center"><div className="flex justify-center"><Skeleton className="h-3 w-[17px] bg-gray-300" /></div></TableCell>
//                                                 ))
//                                             }
//                                         </TableRow>
//                                     ))
//                                 ) : isError || dataAttendances?.length === 0 ? (
//                                     <TableRow>
//                                         <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={skeletonColumnCount}>{error?.message ?? t('mng_time_keeping.no_result')}</TableCell>
//                                     </TableRow>
//                                 ) : (
//                                     // Virtualized rows
//                                     <div
//                                         style={{
//                                             position: 'absolute',
//                                             top: 0,
//                                             left: 0,
//                                             width: '100%',
//                                             transform: `translateY(${virtualRows[0]?.start ?? 0}px)`, // Offset rows
//                                         }}
//                                     >
//                                         {virtualRows.map((virtualRow) => {
//                                             const item = dataAttendances[virtualRow.index];
//                                             if (!item) return null; // Defensive check

//                                             return (
//                                                 <TableRow
//                                                     key={virtualRow.key} // Use virtualRow.key for better virtualization performance
//                                                     data-index={virtualRow.index} // For debugging
//                                                     ref={rowVirtualizer.measureElement} // Essential for dynamic heights if used
//                                                     className="border-b dark:border-[#9b9b9b]"
//                                                 >
//                                                     <TableCell className="text-center border-r">{item.nvMaNV}</TableCell>
//                                                     <TableCell className="text-center border-r">{item.nvHoTen}</TableCell>
//                                                     <TableCell className="text-center border-r">{item.bpTen}</TableCell>
//                                                     {
//                                                         item.dataTimeKeeping.map((data: TimeKeeping, colIndex: number) => {
//                                                             const result = data.result;
//                                                             let bgColor = '';
//                                                             let textColor = 'black';

//                                                             if (result === 'CN-X' || !isNaN(parseFloat(result ?? ''))) {
//                                                                 bgColor = '#FFFFFF';
//                                                             }
//                                                             else {
//                                                                 bgColor = statusColors[result as AttendanceStatus] ?? '';
//                                                             }

//                                                             if (result === 'CN') {
//                                                                 textColor = 'white';
//                                                             }

//                                                             if (result === '?' && new Date(data.bcNgay) < new Date()) {
//                                                                 bgColor = '#FF7B7D';
//                                                             }

//                                                             return (
//                                                                 <TableCell
//                                                                     onClick={() => {
//                                                                         setSelectedData({
//                                                                             nvMaNV: item.nvMaNV,
//                                                                             nvHoTen: item.nvHoTen,
//                                                                             bpTen: item.bpTen,
//                                                                             date: data.bcNgay,
//                                                                             currentValue: result,
//                                                                             currentBgColor: bgColor,
//                                                                             rowIndex: virtualRow.index, // Use virtualRow.index
//                                                                             colIndex: colIndex
//                                                                         });
//                                                                         setOpenUpdateTimeKeeping(true);
//                                                                     }}
//                                                                     style={{ backgroundColor: bgColor || '', color: textColor }}
//                                                                     key={colIndex} // Use colIndex for day cells
//                                                                     className={`p-0 w-[100px] text-center border-r hover:cursor-pointer`}
//                                                                 >
//                                                                     <div className="flex justify-center">
//                                                                         {result === 'CN' ? 'CN' : result}
//                                                                     </div>
//                                                                 </TableCell>
//                                                             );
//                                                         })
//                                                     }
//                                                 </TableRow>
//                                             );
//                                         })}
//                                     </div>
//                                 )}
//                             </TableBody>
//                         </Table>
//                     </div>
//                 </div>
//             </div>
//             {
//                 dataAttendances.length > 0 && totalPage > 1 ? ( // Only show pagination if there are results and more than 1 page
//                     <PaginationControl
//                         currentPage={page}
//                         totalPages={totalPage}
//                         pageSize={pageSize}
//                         onPageChange={setCurrentPage}
//                         onPageSizeChange={handlePageSizeChange}
//                     />
//                 ) : null
//             }
//         </div>
//     );
// }