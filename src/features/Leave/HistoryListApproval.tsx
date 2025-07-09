import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import leaveRequestApi, { HistoryLeaveRequestApproval } from "@/api/leaveRequestApi"
import { useAuthStore } from "@/store/authStore"
import { ENUM_TIME_LEAVE, ENUM_TYPE_LEAVE, getEnumName, useDebounce } from "@/lib"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import DateTimePicker from "@/components/ComponentCustom/Flatpickr"

export default function HistoryListApproval () {
    const { t } = useTranslation();
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const {user} = useAuthStore()
    const [keysearch, setKeySearch] = useState("")
    const [date, setDate] = useState(new Date().toString())

    const debouncedkeySearch = useDebounce(keysearch, 300);
    
    const { data: leaveRequests = [], isPending, isError, error } = useQuery({
        queryKey: ['get-history-leave-request-approval', page, pageSize, debouncedkeySearch, date],
        queryFn: async () => {
            const res = await leaveRequestApi.getHistoryLeaveRequestApproval({
                Page: page,
                PageSize: pageSize,
                UserCode: user?.userCode,
                Keysearch: debouncedkeySearch,
                Date: date
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between mb-1 items-start sm:items-center">
                <h3 className="font-bold text-xl sm:text-2xl m-0 pb-2 sm:pb-0">
                    {t('leave_request.wait_approval.history_leave_request')}
                </h3>
            </div>

            <div className="flex mt-3 ql-align-center">
                <div>
                    <input value={keysearch} onChange={(e) => setKeySearch(e.target.value)} type="text" placeholder="Name, Usercode" className="text-sm pl-1 rounded-[4px] border h-[33px] mr-2" />
                </div>
                <div>
                    <DateTimePicker
                        enableTime={true}
                        dateFormat="Y-m-d"
                        initialDateTime={date}
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onChange={(_selectedDates, dateStr, _instance) => {
                            //rhfField.onChange(dateStr);
                            setDate(dateStr)
                        }}
                        className={`dark:bg-[#454545] shadow-xs border border-gray-300 p-1 rounded-[5px] hover:cursor-pointer`}
                    />
                </div>
            </div>

            <div className="mb-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[600px] overflow-scroll hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[120px] text-left">{t('list_leave_request.usercode')}</TableHead>
                            <TableHead className="w-[180px] text-left">{t('list_leave_request.name')}</TableHead>
                            <TableHead className="w-[130px] text-left">{t('list_leave_request.department')}</TableHead>
                            <TableHead className="w-[100px] text-left">{t('list_leave_request.position')}</TableHead>
                            <TableHead className="w-[150px] text-left">{t('list_leave_request.from')}</TableHead>
                            <TableHead className="w-[150px] text-left">{t('list_leave_request.to')}</TableHead>
                            <TableHead className="w-[120px] text-left">{t('list_leave_request.type_leave')}</TableHead>
                            <TableHead className="w-[120px] text-left">{t('list_leave_request.time_leave')}</TableHead>
                            <TableHead className="w-[200px] text-left">{t('list_leave_request.reason')}</TableHead>
                            <TableHead className="w-[80px] text-left">{t('list_leave_request.approve_by')}</TableHead>
                            <TableHead className="w-[50px] text-left">{t('list_leave_request.approved_at')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                    {[...Array(11)].map((_, i) => (
                                        <TableCell key={i} className="text-left">
                                        <div className="flex justify-center">
                                            <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                        </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            ) : isError || leaveRequests.length == 0 ? (
                            <TableRow>
                                <TableCell className="text-red-700 font-medium text-left dark:text-white" colSpan={11}>
                                    {error?.message ?? t('list_leave_request.no_result')}
                                </TableCell>
                            </TableRow>
                            ) : (
                                leaveRequests.map((item: HistoryLeaveRequestApproval, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell className="text-left">{item.requesterUserCode}</TableCell>
                                        <TableCell className="text-left">{item.name}</TableCell>
                                        <TableCell className="text-left">{item.department}</TableCell>
                                        <TableCell className="text-left">{item.position}</TableCell>
                                        <TableCell className="text-left">{item.fromDate}</TableCell>
                                        <TableCell className="text-left">{item.toDate}</TableCell>
                                        <TableCell className="text-left">{item?.typeLeave?.name}</TableCell>
                                        <TableCell className="text-left">{item?.timeLeave?.description}</TableCell>
                                        <TableCell className="text-left">{item.reason}</TableCell>
                                        <TableCell className="text-left">{item?.historyApplicationForm?.userApproval?? "--"}</TableCell>
                                        <TableCell className="text-left">{formatDate(item.historyApplicationForm.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>    
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="sm:hidden space-y-4">
                    {isPending
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="p-4 border rounded shadow-sm">
                            <Skeleton className="h-4 w-[80%] bg-gray-300 mb-2" />
                            <Skeleton className="h-4 w-[60%] bg-gray-300 mb-2" />
                            <Skeleton className="h-4 w-[90%] bg-gray-300 mb-2" />
                        </div>
                        ))
                    : isError || leaveRequests.length === 0
                    ? (
                            <div className="text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
                        )
                    : leaveRequests.map((item: HistoryLeaveRequestApproval, idx: number) => (
                        <div key={idx} className="p-4 border rounded shadow-sm space-y-2">
                            <div><strong>{t('list_leave_request.usercode')}:</strong> {item.requesterUserCode}</div>
                            <div><strong>{t('list_leave_request.name')}:</strong> {item.name}</div>
                            <div><strong>{t('list_leave_request.department')}:</strong> {item.department}</div>
                            <div><strong>{t('list_leave_request.position')}:</strong> {item.position}</div>
                            <div><strong>{t('list_leave_request.from')}:</strong> {item.fromDate}</div>
                            <div><strong>{t('list_leave_request.to')}:</strong> {item.toDate}</div>
                            <div><strong>{t('list_leave_request.type_leave')}:</strong> {getEnumName(item.typeLeave?.toString() ?? "", ENUM_TYPE_LEAVE)}</div>
                            <div><strong>{t('list_leave_request.time_leave')}:</strong> {getEnumName(item.timeLeave?.toString() ?? "", ENUM_TIME_LEAVE)}</div>
                            <div><strong>{t('list_leave_request.reason')}:</strong> {item.reason}</div>
                            <div><strong>{t('list_leave_request.approve_by')}:</strong> <span>{item.approverName ?? "--"}</span></div>
                            <div><strong>{t('list_leave_request.approved_at')}:</strong> {formatDate(item.approvalAt ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                        </div>
                    ))}
                </div>
            </div>
            {
                leaveRequests.length > 0 ? (<PaginationControl
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
