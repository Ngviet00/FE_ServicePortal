/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
                    { lang == 'vi' ? 'Danh sách BCC đã đăng ký' : 'List timesheet register'}
                </h3>
                <Button asChild className="w-full md:w-auto bg-black hover:bg-black text-white">
                    <Link to="/management-time-keeping">
                        {lang == 'vi' ? 'Bảng chấm công' : 'Timesheet'}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr className="text-black">
                                    <th className="border-gray-300 w-[120px] px-3 py-2 border text-center font-semibold">{lang == 'vi' ? 'Mã đơn' : 'Code'}</th>
                                    <th className="border-gray-300 w-[110px] px-3 py-2 border text-center font-semibold">{lang == 'vi' ? 'Mã NV' : 'Usercode'}</th>
                                    <th className="border-gray-300 w-[160px] px-3 py-2 border text-center font-semibold">{lang == 'vi' ? 'Họ tên' : 'Username'}</th>
                                    <th className="border-gray-300 w-[120px] px-3 py-2 border text-center font-semibold">{lang == 'vi' ? 'Năm tháng' : 'Year month'}</th>
                                    <th className="border-gray-300 w-[150px] px-3 py-2 border text-center font-semibold">{lang == 'vi' ? 'Bộ phận' : 'Department'}</th>
                                    <th className="border-gray-300 w-[160px] px-3 py-2 border text-center font-semibold">{lang == 'vi' ? 'Thời gian tạo' : 'Created at'}</th>
                                    <th className="border-gray-300 w-[130px] px-3 py-2 border text-center font-semibold">{lang == 'vi' ? 'Trạng thái' : 'Status'}</th>
                                    <th className="border-gray-300 w-[100px] px-3 py-2 border text-center font-semibold">{lang == 'vi' ? 'Hành động' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <td key={i} className="border-gray-300 px-3 py-2 border text-center">
                                                    <div className="flex justify-center">
                                                        <Skeleton className="h-4 w-[80px] bg-gray-300" />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError || listTimeKeepings.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-4 text-center font-bold text-red-700 border border-gray-300">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    listTimeKeepings.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50 text-black">
                                            <td className="border-gray-300 px-3 py-2 border text-center font-medium">
                                                <Link to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`} className="text-blue-600 underline">
                                                    {item?.applicationForm?.code}
                                                </Link>
                                            </td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">{item?.applicationForm?.userCodeCreatedForm}</td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">{item?.applicationForm?.userNameCreatedForm}</td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">{item?.yearMonth}</td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">{item?.departmentName}</td>
                                            <td className="border-gray-300 px-3 py-2 border text-center whitespace-nowrap">{formatDate(item?.createdAt ?? "", 'yyyy-MM-dd HH:mm:ss')}</td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">
                                                <StatusLeaveRequest 
                                                    status={item?.applicationForm?.requestStatusId == 1 ? 'Pending' : item?.applicationForm?.requestStatusId == 3 ? 'Completed' : item?.applicationForm?.requestStatusId == 5 ? 'Reject' : 'In Process'}
                                                />
                                            </td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">
                                                <div className="flex justify-center">
                                                    {item?.applicationForm?.requestStatusId == 1 ? (
                                                        <ButtonDeleteComponent id={item?.applicationFormId} onDelete={() => handleDelete(item?.applicationFormId ?? "")} />
                                                    ) : (
                                                        <span className="text-gray-400">--</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {isPending ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="border rounded p-4 space-y-2 shadow bg-white ">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                </div>
                            ))
                        ) : isError || listTimeKeepings.length === 0 ? (
                            <div className="p-2 text-red-700 border text-center font-medium  mt-5">
                                {error?.message ?? tCommon('no_results')}
                            </div>
                        ) : (
                            listTimeKeepings.map((item: any) => (
                                <div key={item.id} className="border rounded-xl p-4 shadow bg-white  space-y-2">
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
                                        <strong>{lang === 'vi' ? 'Năm tháng' : 'Year month'}:</strong> {item?.yearMonth}
                                    </div>
                                    <div>
                                        <strong>{lang === 'vi' ? 'Bộ phận' : 'Department'}:</strong> {item?.departmentName}
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