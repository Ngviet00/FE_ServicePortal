import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { Label } from "@/components/ui/label"

export default function ListFormIT () {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [filterStatus, setFilterStatus] = useState(1)
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

    const handleChangeFilter = () => {
        
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">Danh sách đơn đã tạo</h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/form-it/create">Tạo mới</Link>
                </Button>
            </div>

            <div className="mb-0">
                <Label>Trạng thái</Label>
                <select name="" id="" onChange={handleChangeFilter} className="border mt-2 p-1 w-[9em] rounded-[3px] hover:cursor-pointer">
                    <option value="">--Tất cả--</option>
                    <option value="">Abc</option>
                </select>
            </div>

            <div className="mb-5 shadow-md sm:rounded-lg pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px] text-left">Mã đơn</TableHead>
                                    <TableHead className="w-[350px] text-left">Tiêu đề</TableHead>
                                    <TableHead className="w-[100px] text-left">Người yêu cầu</TableHead>
                                    <TableHead className="w-[100px] text-left">Phòng ban</TableHead>
                                    <TableHead className="w-[100px] text-left">Người đăng ký</TableHead>
                                    <TableHead className="w-[100px] text-left">Thời gian tạo</TableHead>
                                    <TableHead className="w-[100px] text-left">Người xử lý</TableHead>
                                    <TableHead className="w-[100px] text-left">Trạng thái</TableHead>
                                    <TableHead className="w-[100px] text-left">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <TableCell key={i}>
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                </div>
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-red-700 font-medium dark:text-white text-center">
                                            {error?.message ?? t('list_leave_request.no_result')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow key="1">
                                        <TableCell className="text-left">#FIT25080110462344</TableCell>
                                        <TableCell className="text-left w-[260px] whitespace-normal break-words">
                                            Không truy cập được mạng 
                                            Không truy cập được mạng 
                                            Không truy cập được mạng Không truy cập được mạng sá dsadsa sada
                                        </TableCell>
                                        <TableCell className="text-left">Nguyễn Văn Việt</TableCell>
                                        <TableCell className="text-left">MIS</TableCell>
                                        <TableCell className="text-left">Đỗ Văn Tiến </TableCell>
                                        <TableCell className="text-left">2025-08-07 10:12</TableCell>
                                        <TableCell className="text-left">Đỗ Văn Tiến</TableCell>
                                        <TableCell className="text-left">
                                            <StatusLeaveRequest status={`Pending`}/>
                                        </TableCell>
                                        <TableCell className="text-left font-bold text-red-700">Edit | Xoá</TableCell>
                                    </TableRow>
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
                            <div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
                        ) : (
                            leaveRequests.map((item: LeaveRequestData) => (
                                <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                    <div className="mb-1 font-bold">{item.name} ({item.requesterUserCode})</div>
                                    <div className="mb-1"><strong>{t('list_leave_request.department')}:</strong> {item.department}</div>
                                    <div className="mb-1"><strong>{t('list_leave_request.position')}:</strong> {item.position}</div>
                                    <div className="mb-1"><strong>{t('list_leave_request.from')}:</strong> {formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                    <div className="mb-1"><strong>{t('list_leave_request.to')}:</strong>{formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                    <div className="mb-1"><strong>{t('list_leave_request.type_leave')}:</strong> {lang == 'vi' ? item?.typeLeave?.nameV : item?.typeLeave?.name}</div>
                                    <div className="mb-1"><strong>{t('list_leave_request.time_leave')}:</strong> {lang == 'vi' ? item?.timeLeave?.description : item?.timeLeave?.english}</div>
                                    <div className="mb-1"><strong>{t('list_leave_request.reason')}:</strong> {item.reason}</div>
                                    <div className="mb-1"><strong>{t('list_leave_request.write_leave_name')}:</strong> {item.userNameWriteLeaveRequest}</div>
                                </div>
                            ))
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