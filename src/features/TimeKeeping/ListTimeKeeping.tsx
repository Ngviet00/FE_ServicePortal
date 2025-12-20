/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Button } from "@/components/ui/button"
import timekeepingApi, { useDeleteTimeKeeping } from "@/api/HR/timeKeepingApi"

export default function ListTimeKeeping () {
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    const deleteTimeKeeping = useDeleteTimeKeeping()
    
    const { data: listTimeKeepings = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-timekeeping', { page, pageSize, status: status }],
        queryFn: async () => {
            const res = await timekeepingApi.getListTimeKeeping({
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

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-list-timekeeping'] });
        }
    }

    const handleDelete = async (applicationFormId: number) => {
        const shouldGoBack = listTimeKeepings.length === 1;
        await deleteTimeKeeping.mutateAsync(applicationFormId);
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    { lang == 'vi' ? 'Danh sách đơn chấm công đã đăng ký' : 'Registered TimeKeeping Requests'}
                </h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/management-time-keeping">
                        {lang == 'vi' ? 'Quản lý nghỉ phép' : 'Manage timekeeping'}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">

                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f3f4f6] border">
                                    <TableHead className="w-[100px] text-center border">{ lang == 'vi' ? 'Mã đơn' : 'Code' }</TableHead>
                                    <TableHead className="w-[100px] text-center border">{ lang == 'vi' ? 'Mã nhân viên' : 'Usercode' }</TableHead>
                                    <TableHead className="w-[150px] text-center border">{ lang == 'vi' ? 'Họ tên' : 'Username' }</TableHead>
                                    <TableHead className="w-[130px] text-center border">{ lang == 'vi' ? 'Tháng' : 'Month' }</TableHead>
                                    <TableHead className="w-[130px] text-center border">{ lang == 'vi' ? 'Năm' : 'Year' }</TableHead>
                                    <TableHead className="w-[130px] text-center border">{ lang == 'vi' ? 'Thời gian tạo' : 'Created at' }</TableHead>
                                    <TableHead className="w-[130px] text-center border">{ lang == 'vi' ? 'Trạng thái' : 'Status' }</TableHead>
                                    <TableHead className="w-[150px] text-center border">{lang == 'vi' ? 'Hành động' : 'Action'} </TableHead>
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <TableCell key={i} className="border">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                </div>
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                ) : isError || listTimeKeepings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-red-700 border text-center font-medium dark:text-white">
                                            { error?.message ?? tCommon('no_results') }
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listTimeKeepings.map((item: any) => {
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-center border">
                                                    <Link to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`} className="text-blue-600 underline">{item?.applicationForm?.code}</Link>
                                                </TableCell>
                                                <TableCell className="text-center border">{item?.applicationForm?.userCodeCreatedForm}</TableCell>
                                                <TableCell className="text-center border">{item?.applicationForm?.userNameCreatedForm}</TableCell>
                                                <TableCell className="text-center border">{item?.month}</TableCell>
                                                <TableCell className="text-center border">{item?.year}</TableCell>
                                                <TableCell className="text-center border">{formatDate(item?.createdAt ?? "", 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                                                <TableCell className="text-center border">
                                                    <StatusLeaveRequest 
                                                        status={item?.applicationForm?.requestStatusId == 1 ? 'Pending' : item?.applicationForm?.requestStatusId == 3 ? 'Completed' : item?.applicationForm?.requestStatusId == 5 ? 'Reject' : 'In Process'}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center border">
                                                    {
                                                        item?.applicationForm?.requestStatusId == 1 ? <ButtonDeleteComponent id={item?.applicationFormId} onDelete={() => handleDelete(item?.applicationFormId ?? "")} /> :  <span>--</span> 
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
                        ) : isError || listTimeKeepings.length === 0 ? (
                            <div className="p-2 text-red-700 border text-center font-medium dark:text-white mt-5">
                                {error?.message ?? tCommon('no_results')}
                            </div>
                        ) : (
                            listTimeKeepings.map((item: any) => (
                                <div key={item.id} className="border rounded-xl p-4 shadow bg-white dark:bg-gray-800 space-y-2">
                                    <div>
                                        <strong>{lang === 'vi' ? 'Mã đơn' : 'Code'}:</strong>{' '}
                                        <Link
                                            to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`}
                                            className="text-blue-600 underline"
                                        >
                                            {item?.applicationForm?.code}
                                        </Link>
                                    </div>

                                    <div>
                                        <strong>{lang === 'vi' ? 'Mã nhân viên' : 'Usercode'}:</strong>{' '}
                                        {item?.applicationForm?.userCodeCreatedForm}
                                    </div>

                                    <div>
                                        <strong>{lang === 'vi' ? 'Họ tên' : 'Username'}:</strong>{' '}
                                        {item?.applicationForm?.userNameCreatedForm}
                                    </div>

                                    <div>
                                        <strong>{lang === 'vi' ? 'Tháng' : 'Month'}:</strong> {item?.month}
                                    </div>
                                    <div>
                                        <strong>{lang === 'vi' ? 'Năm' : 'Year'}:</strong> {item?.year}
                                    </div>

                                    <div>
                                        <strong>{lang === 'vi' ? 'Thời gian tạo' : 'Created at'}:</strong>{' '}
                                        {formatDate(item?.createdAt ?? '', 'yyyy-MM-dd HH:mm:ss')}
                                    </div>

                                    <div className="flex items-center">
                                        <strong className="mr-1">{lang === 'vi' ? 'Trạng thái' : 'Status'}:</strong>
                                        <StatusLeaveRequest
                                            status={
                                                item?.applicationForm?.requestStatusId == 1
                                                    ? 'Pending'
                                                    : item?.applicationForm?.requestStatusId == 3
                                                    ? 'Completed'
                                                    : item?.applicationForm?.requestStatusId == 5
                                                    ? 'Reject'
                                                    : 'In Process'
                                            }
                                        />
                                    </div>
                                    <div>
                                        <strong>{lang === 'vi' ? 'Hành động' : 'Action'}:</strong>{' '}
                                        {item?.applicationForm?.requestStatusId == 1 ? (
                                            <div className="flex items-center gap-2 mt-1">
                                                <ButtonDeleteComponent
                                                    id={item?.applicationFormId}
                                                    onDelete={() => handleDelete(item?.applicationFormId ?? '')}
                                                />
                                            </div>
                                        ) : (
                                            <span>--</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {
                listTimeKeepings.length > 0 ? (<PaginationControl
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