import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import leaveRequestApi, { LeaveRequestData } from "@/api/leaveRequestApi"
import { useAuthStore } from "@/store/authStore"
import { ENUM_TIME_LEAVE, ENUM_TYPE_LEAVE, formatDate, getEnumName, getErrorMessage, ShowToast } from "@/lib"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { useTranslation } from "react-i18next"

export default function ListLeaveRequest () {
    const { t } = useTranslation();
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [filterStatus, setFilterStatus] = useState("PENDING")
    const [countPending, setCountPending] = useState(0)
    const [countInProcess, setCountInProcess] = useState(0)
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    
    const { data: leaveRequests = [], isPending, isError, error } = useQuery({
        queryKey: ['get-leave-requests', { user_code: user?.userCode, page, pageSize, status: filterStatus }],
        queryFn: async () => {
            const res = await leaveRequestApi.getAll({
                UserCode: user?.userCode ?? "",
                Page: page,
                PageSize: pageSize,
                Status: filterStatus
            });
            setTotalPage(res.data.total_pages)
            setCountPending(res.data.count_pending)
            setCountInProcess(res.data.count_in_process)
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

    const handleChangeFilter = (status: string) => {
        setFilterStatus(status);
    }

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-leave-requests'] });
        }
    }

    const mutation = useMutation({
        mutationFn: async (id: string) => {
            await leaveRequestApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (error) => {
            ShowToast(getErrorMessage(error), "error");
        }
    });

    const handleDelete = async (id: string) => {
        try {
            const shouldGoBack = leaveRequests.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('list_leave_request.title_list')}</h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/leave/create">{t('list_leave_request.btn_create_leave_request')}</Link>
                </Button>
            </div>

            <div className="mb-5 shadow-md sm:rounded-lg pb-3">
                <div className="p-3">
                    <Tabs defaultValue="1" className="w-full" onValueChange={handleChangeFilter}>
                        <TabsList className="mb-5 flex flex-wrap justify-center gap-2 p-0">
                            <TabsTrigger
                            className="dark:text-black min-w-[120px] px-3 py-1 text-sm bg-gray-200 text-gray-600 hover:cursor-pointer"
                            value="PENDING"
                            >
                                {t('list_leave_request.pending')}
                                {countPending > 0 && <span className="ml-1 text-red-500">({countPending})</span>}
                            </TabsTrigger>

                            <TabsTrigger
                            className="dark:text-black min-w-[120px] px-3 py-1 text-sm bg-yellow-200 text-yellow-600 hover:cursor-pointer"
                            value="IN_PROCESS"
                            >
                                {t('list_leave_request.in_process')}
                                {countInProcess > 0 && <span className="ml-1 text-red-500">({countInProcess})</span>}
                            </TabsTrigger>

                            <TabsTrigger
                            className="dark:text-black min-w-[120px] px-3 py-1 text-sm bg-green-200 text-green-600 hover:cursor-pointer"
                            value="COMPLETED"
                            >
                                {t('list_leave_request.complete')}
                            </TabsTrigger>

                            <TabsTrigger
                            className="dark:text-black min-w-[120px] px-3 py-1 text-sm bg-red-200 text-red-600 hover:cursor-pointer"
                            value="REJECT"
                            >
                                {t('list_leave_request.reject')}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="overflow-x-auto max-h-[500px] mt-8">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-left">{t('list_leave_request.usercode')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_leave_request.name')}</TableHead>
                                <TableHead className="w-[130px] text-left">{t('list_leave_request.department')}</TableHead>
                                <TableHead className="w-[100px] text-left">{t('list_leave_request.position')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_leave_request.from')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_leave_request.to')}</TableHead>
                                <TableHead className="w-[120px] text-left">{t('list_leave_request.type_leave')}</TableHead>
                                <TableHead className="w-[120px] text-left">{t('list_leave_request.time_leave')}</TableHead>
                                <TableHead className="w-[200px] text-center">{t('list_leave_request.reason')}</TableHead>
                                <TableHead className="w-[120px] text-center">{filterStatus == "REJECT" ? t('list_leave_request.reject_by') : t('list_leave_request.approve_by')}</TableHead>
                                <TableHead className="w-[50px] text-left">{filterStatus == "PENDING" ? t('list_leave_request.created_at') : filterStatus == "REJECT" ? t('list_leave_request.reject_at') : t('list_leave_request.created_at')}</TableHead>
                                <TableHead className={`w-[${filterStatus == "REJECT" ? "120px" : "70px"}] text-left`}>
                                    {filterStatus == "REJECT" ? t('list_leave_request.note') : t('list_leave_request.status')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            { isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[180px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[130px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[150px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[150px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[200px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[80px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[50px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[50px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                    </TableRow>
                                    ))
                            ) : isError || leaveRequests.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`text-red-700 font-medium text-left dark:text-white`} colSpan={13}>{error?.message ?? t('list_leave_request.no_result')}</TableCell>
                                </TableRow>
                            ) : (
                                leaveRequests.map((item: LeaveRequestData) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-left">{item?.requesterUserCode}</TableCell>
                                            <TableCell className="text-left">{item?.name}</TableCell>
                                            <TableCell className="text-left">{item?.department}</TableCell>
                                            <TableCell className="text-left">{item?.position}</TableCell>
                                            <TableCell className="text-left">{formatDate(item?.fromDate ?? "", "yyyy/MM/dd HH:mm")}</TableCell>
                                            <TableCell className="text-left">{formatDate(item?.toDate ?? "", "yyyy/MM/dd HH:mm")}</TableCell>
                                            <TableCell className="text-left">{getEnumName(item?.typeLeave?.toString() ?? "", ENUM_TYPE_LEAVE)}</TableCell>
                                            <TableCell className="text-left">{getEnumName(item?.timeLeave?.toString() ?? "", ENUM_TIME_LEAVE)}</TableCell>
                                            <TableCell className="text-center">{item?.reason}</TableCell>
                                            <TableCell className="text-center text-red-800 font-bold">{item?.approvalAction?.approverName ?? "--"}</TableCell>
                                            <TableCell className="text-left">
                                                {
                                                    item?.approvalAction?.createdAt ? formatDate(item.approvalAction.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")
                                                    : formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")
                                                }
                                            </TableCell>
                                            <TableCell className="text-left">
                                                {
                                                    //reject
                                                    filterStatus == "REJECT" ? (
                                                        <span
                                                            className={`${item.approvalAction?.comment ? "text-red-500" : "text-black"} font-bold block w-[150px] overflow-hidden text-ellipsis whitespace-nowrap`}
                                                            title={item.approvalAction?.comment ?? ""}
                                                        >
                                                            {item.approvalAction?.comment ? item.approvalAction.comment : "--"}
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {
                                                                filterStatus == "PENDING" ? (<>
                                                                    <Link to={`/leave/edit/${item.id}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] h-[23.98px]">Edit</Link>
                                                                    <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id ?? "")}/>
                                                                </>
                                                                ) : (<StatusLeaveRequest status={item?.approvalAction?.action ? item.approvalAction.action : "PENDING" }/>)
                                                            }
                                                        </>
                                                    )
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            }
                        </TableBody>
                    </Table>
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