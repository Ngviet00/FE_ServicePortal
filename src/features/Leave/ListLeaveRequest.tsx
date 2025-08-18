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
import { getErrorMessage, ShowToast } from "@/lib"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"

export default function ListLeaveRequest () {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [filterStatus, setFilterStatus] = useState(1)
    const [countPending, setCountPending] = useState(0)
    const [countInProcess, setCountInProcess] = useState(0)
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    
    const { data: leaveRequests = [], isPending, isError, error } = useQuery({
        queryKey: ['get-leave-requests', { page, pageSize, status: filterStatus }],
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
        setFilterStatus(parseInt(status));
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
        const shouldGoBack = leaveRequests.length === 1;
        await mutation.mutateAsync(id);
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('list_leave_request.title_list')}</h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/leave/create">{t('list_leave_request.btn_create_leave_request')}</Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="p-3">
                    <Tabs defaultValue="1" className="w-full" onValueChange={handleChangeFilter}>
                        <TabsList className="mb-5 flex flex-wrap justify-center gap-2 p-0">
                            <TabsTrigger
                            className="dark:text-black min-w-[120px] px-3 py-1 text-sm bg-gray-200 text-gray-600 hover:cursor-pointer"
                            value="1"
                            >
                                {t('list_leave_request.pending')}
                                {countPending > 0 && <span className="ml-1 text-red-500">({countPending})</span>}
                            </TabsTrigger>

                            <TabsTrigger
                            className="dark:text-black min-w-[120px] px-3 py-1 text-sm bg-yellow-200 text-yellow-600 hover:cursor-pointer"
                            value="2"
                            >
                                {t('list_leave_request.in_process')}
                                {countInProcess > 0 && <span className="ml-1 text-red-500">({countInProcess})</span>}
                            </TabsTrigger>

                            <TabsTrigger
                            className="dark:text-black min-w-[120px] px-3 py-1 text-sm bg-green-200 text-green-600 hover:cursor-pointer"
                            value="3"
                            >
                                {t('list_leave_request.complete')}
                            </TabsTrigger>

                            <TabsTrigger
                            className="dark:text-black min-w-[120px] px-3 py-1 text-sm bg-red-200 text-red-600 hover:cursor-pointer"
                            value="5"
                            >
                                {t('list_leave_request.reject')}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f3f4f6] border">
                                    <TableHead className="w-[100px] text-left border">{t('list_leave_request.usercode')}</TableHead>
                                    <TableHead className="w-[150px] text-left border">{t('list_leave_request.name')}</TableHead>
                                    <TableHead className="w-[130px] text-left border">{t('list_leave_request.department')}</TableHead>
                                    <TableHead className="w-[100px] text-left border">{t('list_leave_request.position')}</TableHead>
                                    <TableHead className="w-[150px] text-left border">{t('list_leave_request.from')}</TableHead>
                                    <TableHead className="w-[150px] text-left border">{t('list_leave_request.to')}</TableHead>
                                    <TableHead className="w-[120px] text-left border">{t('list_leave_request.type_leave')}</TableHead>
                                    <TableHead className="w-[120px] text-left border">{t('list_leave_request.time_leave')}</TableHead>
                                    <TableHead className="w-[200px] text-center border">{t('list_leave_request.reason')}</TableHead>
                                    <TableHead className="w-[150px] text-left border">{t('list_leave_request.write_leave_name')}</TableHead>
                                    {
                                        filterStatus == 1 ? (
                                            <>
                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.created_at')}
                                                </TableHead>

                                                <TableHead className="w-[120px] text-left border">
                                                    {t('list_leave_request.status')}
                                                </TableHead>
                                            </>
                                        )
                                        : filterStatus == 2 ? (
                                            <>
                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.created_at')}
                                                </TableHead>
                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.approve_by')}
                                                </TableHead>
                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.approved_at')}
                                                </TableHead>

                                                <TableHead className="w-[120px] text-left border">
                                                    {t('list_leave_request.status')}
                                                </TableHead>
                                            </>
                                        )
                                        : filterStatus == 3 ? (
                                            <>
                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.created_at')}
                                                </TableHead>
                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.approve_by')}
                                                </TableHead>
                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.approved_at')}
                                                </TableHead>

                                                <TableHead className="w-[120px] text-left border">
                                                    {t('list_leave_request.status')}
                                                </TableHead>
                                            </>
                                        )
                                        : (
                                            <>
                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.created_at')}
                                                </TableHead>

                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.approve_by')}
                                                </TableHead>

                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.approved_at')}
                                                </TableHead>

                                                <TableHead className="w-[120px] text-center border">
                                                    {t('list_leave_request.note')}
                                                </TableHead>

                                                <TableHead className="w-[120px] text-left border">
                                                    {t('list_leave_request.status')}
                                                </TableHead>
                                            </>
                                        )
                                    }
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: filterStatus == 1 ? 12 : filterStatus == 2 || filterStatus == 3 ? 14 : 15 }).map((_, i) => (
                                            <TableCell key={i}>
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                </div>
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                ) : isError || leaveRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={filterStatus == 1 ? 12 : filterStatus == 2 || filterStatus == 3 ? 14 : 15} className="text-red-700 border text-center font-medium dark:text-white">
                                            {error?.message ?? t('list_leave_request.no_result')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaveRequests.map((item: LeaveRequestData) => {
                                        const latestHistoryApproval = item?.applicationForm?.historyApplicationForms?.[0]
                                        
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-left border">{item?.userCodeRequestor}</TableCell>
                                                <TableCell className="text-left border">{item?.userNameRequestor}</TableCell>
                                                <TableCell className="text-left border">{item?.orgUnit?.name}</TableCell>
                                                <TableCell className="text-left border">{item.position}</TableCell>
                                                <TableCell className="text-left border">{ formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss") }</TableCell>
                                                <TableCell className="text-left border">{ formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss") }</TableCell>
                                                <TableCell className="text-left border">{lang == 'vi' ? item?.typeLeave?.name : item?.typeLeave?.nameE}</TableCell>
                                                <TableCell className="text-left border">{lang == 'vi' ? item?.timeLeave?.name : item?.timeLeave?.nameE}</TableCell>
                                                <TableCell className="text-center border">{item.reason}</TableCell>
                                                <TableCell className="text-center font-bold text-red-700 border">{item.createdBy}</TableCell>
                                                {
                                                    filterStatus == 1 ? (
                                                        <>
                                                            <TableCell className="text-left border">
                                                                { formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }
                                                            </TableCell>

                                                            <TableCell className="text-left border">
                                                                <Link to={`/leave/edit/${item.id}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                                    Edit
                                                                </Link>
                                                                <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id ?? "")} />
                                                            </TableCell>
                                                        </>
                                                    )
                                                    : filterStatus == 2 ? (
                                                        <>
                                                            <TableCell className="text-left border">
                                                                { formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }
                                                            </TableCell>

                                                             <TableCell className="text-center text-red-700 font-bold border">
                                                                { latestHistoryApproval?.userNameApproval ?? "--" }
                                                            </TableCell>

                                                            <TableCell className="text-center border">
                                                                {
                                                                    latestHistoryApproval?.createdAt ? formatDate(latestHistoryApproval?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") : "--"
                                                                }
                                                            </TableCell>

                                                            <TableCell className="text-left border">
                                                                <StatusLeaveRequest status="In Process" />
                                                            </TableCell>
                                                        </>
                                                    )
                                                    : filterStatus == 3 ? (
                                                        <>
                                                            <TableCell className="text-left border">
                                                                { formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }
                                                            </TableCell>

                                                            <TableCell className="text-center text-red-700 font-bold border">
                                                                { latestHistoryApproval?.userNameApproval ?? "--" }
                                                            </TableCell>

                                                            <TableCell className="text-center border">
                                                                {
                                                                    latestHistoryApproval?.createdAt ? formatDate(latestHistoryApproval?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") : "--"
                                                                }
                                                            </TableCell>

                                                            <TableCell className="text-left border">
                                                                <StatusLeaveRequest status="Completed" />
                                                            </TableCell>
                                                        </>
                                                    )
                                                    : (
                                                        <>
                                                            <TableCell className="text-left border">
                                                                { formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }
                                                            </TableCell>

                                                            <TableCell className="text-left font-bold text-red-700 border">
                                                                { latestHistoryApproval?.userNameApproval }
                                                            </TableCell>

                                                            <TableCell className="text-left border">
                                                                { formatDate(latestHistoryApproval?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }
                                                            </TableCell>

                                                            <TableCell className="text-left font-bold text-red-700 border">
                                                                { latestHistoryApproval?.note && latestHistoryApproval?.note != '' ? latestHistoryApproval?.note : "--" }
                                                            </TableCell>

                                                            <TableCell className="text-left border">
                                                                <StatusLeaveRequest status="Reject" />
                                                            </TableCell>
                                                        </>
                                                    )
                                                }
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                    </div>
                                ))
                            ) : isError || leaveRequests.length === 0 ? (
                                <div className="pt-2 pl-4 text-red-700 border text-center font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
                            ) : (
                                leaveRequests.map((item: LeaveRequestData) => {
                                    const latestHistoryApproval = item?.applicationForm?.historyApplicationForms?.[0]

                                    return (
                                        <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                            <div className="mb-1 font-bold">{item.userNameRequestor} ({item.userCodeRequestor})</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.department')}:</strong> {item.department}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.position')}:</strong> {item.position}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.from')}:</strong> {formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.to')}:</strong>{formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.type_leave')}:</strong> {lang == 'vi' ? item?.typeLeave?.name : item?.typeLeave?.nameE}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.time_leave')}:</strong> {lang == 'vi' ? item?.timeLeave?.name : item?.timeLeave?.nameE}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.reason')}:</strong> {item.reason}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.write_leave_name')}:</strong> {item.userNameWriteLeaveRequest}</div>
                                            {
                                                filterStatus == 1 ? (
                                                    <>
                                                        <div className="mb-1"><strong>{t('list_leave_request.created_at')}: </strong>{ formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.status')}: </strong><StatusLeaveRequest status="PENDING" /></div>
                                                        <div className="mb-1">
                                                                <Link to={`/leave/edit/${item.id}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                                    Edit
                                                                </Link>
                                                                <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id ?? "")} />
                                                        </div>
                                                    </>
                                                )
                                                : filterStatus == 2 ? (
                                                    <>
                                                        <div className="mb-1"><strong>{t('list_leave_request.created_at')}: </strong>{ formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.approve_by')}: </strong>{ latestHistoryApproval?.userNameApproval ?? "--" }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.approved_at')}: </strong>
                                                            {
                                                                latestHistoryApproval?.createdAt ? formatDate(latestHistoryApproval?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") : "--"
                                                            }
                                                        </div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.status')}: </strong><StatusLeaveRequest status="IN_PROCESS" /></div>
                                                        </>
                                                )
                                                : filterStatus == 3 ? (
                                                    <>
                                                        <div className="mb-1"><strong>{t('list_leave_request.created_at')}: </strong>{ formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.approve_by')}: </strong>{ latestHistoryApproval?.userNameApproval ?? "--" }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.approved_at')}: </strong>
                                                            {
                                                                latestHistoryApproval?.createdAt ? formatDate(latestHistoryApproval?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") : "--"
                                                            }
                                                        </div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.status')}: </strong><StatusLeaveRequest status="COMPLETED" /></div>
                                                    </>
                                                )
                                                : (
                                                    <>
                                                        <div className="mb-1"><strong>{t('list_leave_request.created_at')}: </strong>{ formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.approve_by')}: </strong>{ latestHistoryApproval?.userNameApproval }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.approved_at')} </strong>{ formatDate(latestHistoryApproval?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.note')}: </strong>{ latestHistoryApproval?.note && latestHistoryApproval?.note != '' ? latestHistoryApproval?.note : "--" }</div>
                                                        <div className="mb-1"><strong>{t('list_leave_request.status')}: </strong><StatusLeaveRequest status="REJECT" /></div>
                                                    </>
                                                )
                                            }
                                        </div>
                                    )
                                }
                            )
                            )}
                        </div>
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