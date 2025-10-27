import { Skeleton } from "@/components/ui/skeleton"
import { ChangeEvent, useState } from "react"
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
import leaveRequestApi from "@/api/leaveRequestApi"
import { useAuthStore } from "@/store/authStore"
import { getErrorMessage, ShowToast } from "@/lib"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Label } from "@/components/ui/label"
import { IRequestStatus } from "@/api/itFormApi"
import { IRequestType } from "@/api/requestTypeApi"
import { Button } from "@/components/ui/button"

interface GetMyLeaveRequestRegistered {
    id?: string,
    code?: string,
    userNameCreatedForm?: string,
    createdAt?: string,
    requestStatus?: IRequestStatus,
    requestType?: IRequestType
}

export default function ListLeaveRequestRegistered () {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [status, setStatus] = useState('')
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    
    const { data: leaveRequestRegistered = [], isPending, isError, error } = useQuery({
        queryKey: ['get-leave-requests-registered', { page, pageSize, status: status }],
        queryFn: async () => {
            const res = await leaveRequestApi.getLeaveRequestRegistered({
                UserCode: user?.userCode ?? "",
                Page: page,
                PageSize: pageSize,
                Status: status == '' ? null : parseInt(status)
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

    const handleOnChangeStatus = (e: ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    }

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-leave-requests-registered'] });
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

    const handleDelete = async (code: string) => {
        const shouldGoBack = leaveRequestRegistered.length === 1;
        await mutation.mutateAsync(code);
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    { lang == 'vi' ? 'Danh sách đơn đã đăng ký' : 'Registered Leave Requests'}
                </h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/leave/create">
                        {lang == 'vi' ? 'Tạo đơn nghỉ phép' : 'Create leave request'}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mb-2">
                    <Label className="mb-2">{t('list_leave_request.status')}</Label>
                    <select value={status} onChange={(e) => handleOnChangeStatus(e)} className="border p-1 rounded cursor-pointer">
                        <option value="">{ lang == 'vi' ? 'Tất cả' : 'All' }</option>
                        <option value="1">{ lang == 'vi' ? 'Đang chờ' : 'Pending' }</option>
                        <option value="2">{ lang == 'vi' ? 'Đang xử lý' : 'In Process' }</option>
                        <option value="3">{ lang == 'vi' ? 'Hoàn thành' : 'Completed' }</option>
                        <option value="5">{ lang == 'vi' ? 'Từ chối' : 'Rejected' }</option>
                    </select>
                </div>

                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f3f4f6] border">
                                    <TableHead className="w-[100px] text-center border">{ lang == 'vi' ? 'Mã đơn' : 'Code' }</TableHead>
                                    <TableHead className="w-[100px] text-center border">Loại đơn</TableHead>
                                    <TableHead className="w-[100px] text-center border">Người tạo</TableHead>
                                    <TableHead className="w-[150px] text-center border">Thời gian tạo</TableHead>
                                    <TableHead className="w-[130px] text-center border">Trạng thái đơn</TableHead>
                                    <TableHead className="w-[150px] text-center border">{lang == 'vi' ? 'Hành động' : 'Action'} </TableHead>
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <TableCell key={i} className="border">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                </div>
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                ) :  isError || leaveRequestRegistered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-red-700 border text-center font-medium dark:text-white">
                                            {error?.message ?? t('list_leave_request.no_result')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaveRequestRegistered.map((item: GetMyLeaveRequestRegistered) => {
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-center border">
                                                    <Link to={`/leave/view/${item.code}?code=${user?.userCode}`} className="text-blue-600 underline">{item?.code}</Link>
                                                </TableCell>
                                                <TableCell className="text-center border">{lang == 'vi' ? item?.requestType?.name : item?.requestType?.nameE}</TableCell>
                                                <TableCell className="text-center border">{item?.userNameCreatedForm}</TableCell>
                                                <TableCell className="text-center border">{formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>
                                                <TableCell className="text-center border">
                                                    <StatusLeaveRequest 
                                                        status={item.requestStatus?.id == 1 ? 'Pending' : item?.requestStatus?.id == 3 ? 'Completed' : item?.requestStatus?.id == 5 ? 'Reject' : 'In Process'}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center border">
                                                    {
                                                        item?.requestStatus?.id == 1 ? (
                                                            <>
                                                                <Link to={`/leave/edit/${item?.code}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                                    {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                                </Link>
                                                                <ButtonDeleteComponent id={item?.code} onDelete={() => handleDelete(item?.code ?? "")} />
                                                            </>
                                                        ) : (
                                                            <span>--</span>
                                                        )
                                                    }
                                                </TableCell>
                                                
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
                            ) : isError || leaveRequestRegistered.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium dark:text-white mt-5">{error?.message ?? t('list_leave_request.no_result')}</div>
                            ) : (
                                leaveRequestRegistered.map((item: GetMyLeaveRequestRegistered) => {
                                    return (
                                        <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Mã đơn' : 'Code'}: </strong>
                                                <Link to={`/leave/view/${item.code}?code=${user?.userCode}`} className="text-blue-600 underline">
                                                     {item?.code}
                                                </Link>
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Loại đơn' : 'Request type'}: </strong> { lang == 'vi' ? item?.requestType?.name : item?.requestType?.nameE }
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Người tạo' : 'Created By'}: </strong> { lang == 'vi' ? item?.userNameCreatedForm : item?.userNameCreatedForm }
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Thời gian tạo' : 'Created At'}: </strong> { formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Trạng thái' : 'Status'}: </strong> 
                                                <StatusLeaveRequest 
                                                    status={item.requestStatus?.id == 1 ? 'Pending' : item?.requestStatus?.id == 3 ? 'Completed' : item?.requestStatus?.id == 5 ? 'Reject' : 'In Process'}
                                                />
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Hành động' : 'Action'}: </strong> 
                                                {
                                                    item?.requestStatus?.id == 1 ? (
                                                        <>
                                                            <Link to={`/leave/edit/${item?.code}`} className="bg-black text-white px-[10px] py-[5px] rounded-[3px] text-sm">
                                                                {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                            </Link>
                                                            <ButtonDeleteComponent id={item?.code} onDelete={() => handleDelete(item?.code ?? "")} />
                                                        </>
                                                    ) : (
                                                        <span>--</span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            )
                        )}
                    </div>
                </div>
            </div>
            {
                leaveRequestRegistered.length > 0 ? (<PaginationControl
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