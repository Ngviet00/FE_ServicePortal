import { Skeleton } from "@/components/ui/skeleton"
import { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import leaveRequestApi, { GetMyLeaveRequest } from "@/api/leaveRequestApi"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Label } from "@/components/ui/label"

export default function ListLeaveRequest () {
    const { t } = useTranslation();
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [status, setStatus] = useState('')
    const {user} = useAuthStore()
    
    const { data: leaveRequests = [], isPending, isError, error } = useQuery({
        queryKey: ['get-leave-requests', { page, pageSize, status: status }],
        queryFn: async () => {
            const res = await leaveRequestApi.getAll({
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

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {lang == 'vi' ? 'Đơn nghỉ phép của tôi' : 'My Leave Requests'}
                </h3>
                <Button asChild className="w-full md:w-auto bg-black text-white hover:bg-black">
                    <Link to="/leave/create">
                        {lang == 'vi' ? 'Tạo đơn nghỉ phép' : 'Create leave request'}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mb-2">
                    <Label className="mb-2">{t('list_leave_request.status')}</Label>
					<select value={status} onChange={(e) => handleOnChangeStatus(e)} className="border p-1 rounded cursor-pointer border-gray-300">
						<option value="">{ lang == 'vi' ? 'Tất cả' : 'All' }</option>
                        <option value="1">{ lang == 'vi' ? 'Đang chờ' : 'Pending' }</option>
                        <option value="2">{ lang == 'vi' ? 'Đang xử lý' : 'In Process' }</option>
                        <option value="3">{ lang == 'vi' ? 'Hoàn thành' : 'Completed' }</option>
                        <option value="5">{ lang == 'vi' ? 'Từ chối' : 'Rejected' }</option>
					</select>
                </div>

                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr className="text-black">
                                    <th className="w-[100px] text-center border border-gray-300 py-2">{ lang == 'vi' ? 'Mã đơn' : 'Code' }</th>
                                    <th className="w-[100px] text-center border border-gray-300 py-2">{t('list_leave_request.usercode')}</th>
                                    <th className="w-[150px] text-center border border-gray-300 py-2">{t('list_leave_request.name')}</th>
                                    <th className="w-[130px] text-center border border-gray-300 py-2">{t('list_leave_request.department')}</th>
                                    <th className="w-[100px] text-center border border-gray-300 py-2">{t('list_leave_request.position')}</th>
                                    <th className="w-[80px] text-center border border-gray-300 py-2">{t('list_leave_request.from')}</th>
                                    <th className="w-[80px] text-center border border-gray-300 py-2">{t('list_leave_request.to')}</th>
                                    <th className="w-[120px] text-center border border-gray-300 py-2">{t('list_leave_request.type_leave')}</th>
                                    <th className="w-[120px] text-center border border-gray-300 py-2">{t('list_leave_request.time_leave')}</th>
                                    <th className="w-[200px] text-center border border-gray-300 py-2">{t('list_leave_request.reason')}</th>
                                    <th className="w-[150px] text-center border border-gray-300 py-2">{t('list_leave_request.write_leave_name')}</th>
                                    <th className="w-[150px] text-center border border-gray-300 py-2">{t('list_leave_request.created_at')}</th>
                                    <th className="w-[150px] text-center border border-gray-300 py-2">{t('list_leave_request.status')}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            {Array.from({ length: 13 }).map((_, i) => (
                                                <td key={i} className="border">
                                                    <div className="flex justify-center">
                                                        <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError || leaveRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="text-red-700 border text-center font-medium ">
                                            {error?.message ?? t('list_leave_request.no_result')}
                                        </td>
                                    </tr>
                                ) : (
                                    leaveRequests.map((item: GetMyLeaveRequest) => (
                                        <tr key={item.leaveRequestId}>
                                            <td className="text-center border border-gray-300 px-4 py-2">
                                                <Link
                                                    to={`/view/${item?.code}?requestType=${item?.requestTypeId}`}
                                                    className="text-blue-600 underline"
                                                >
                                                    {item?.code}
                                                </Link>
                                            </td>

                                            <td className="text-center border border-gray-300 px-4 py-2">{item?.userCode}</td>
                                            <td className="text-center border border-gray-300 px-4 py-2">{item?.userName}</td>
                                            <td className="text-center border border-gray-300 px-4 py-2">{item?.departmentName}</td>
                                            <td className="text-center border border-gray-300 px-4 py-2">{item.position}</td>

                                            <td className="text-center border border-gray-300 px-4 py-2">
                                                {formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}
                                            </td>

                                            <td className="text-center border border-gray-300 px-4 py-2">
                                                {formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}
                                            </td>

                                            <td className="text-center border border-gray-300 px-4 py-2">
                                                {lang == 'vi' ? item?.typeLeaveName : item?.typeLeaveNameE}
                                            </td>

                                            <td className="text-center border border-gray-300 px-4 py-2">
                                                {lang == 'vi' ? item?.timeLeaveName : item?.timeLeaveNameE}
                                            </td>

                                            <td className="text-center border border-gray-300 px-4 py-2">{item?.reason}</td>

                                            <td className="text-center font-bold text-red-700 border border-gray-300 px-4 py-2">
                                                {item?.userNameCreatedForm}
                                            </td>

                                            <td className="text-center border border-gray-300 px-4 py-2">
                                                {formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}
                                            </td>

                                            <td className="text-center border border-gray-300 px-4 py-2">
                                                <StatusLeaveRequest
                                                    status={
                                                        item.requestStatusId == 1
                                                            ? 'Pending'
                                                            : item.requestStatusId == 3
                                                            ? 'Completed'
                                                            : item.requestStatusId == 5
                                                            ? 'Reject'
                                                            : 'In Process'
                                                    }
                                                />
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
                            ) : isError || leaveRequests.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium  mt-5">{error?.message ?? t('list_leave_request.no_result')}</div>
                            ) : (
                                leaveRequests.map((item: GetMyLeaveRequest) => {
                                    return (
                                        <div key={item.leaveRequestId} className="border rounded p-4 shadow bg-white  mt-5">
                                            <div className="mb-1 font-bold">{item?.userName} ({item?.userCode})</div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Mã đơn' : 'Code'}: </strong>
                                                <Link to={`/view/${item?.code}?requestType=${item?.requestTypeId}`} className="text-blue-600 underline">
                                                     {item?.code}
                                                </Link>
                                            </div>
                                            <div className="mb-1"><strong>{t('list_leave_request.department')}:</strong> {item?.departmentName}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.position')}:</strong> {item.position}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.from')}:</strong> {formatDate(item.fromDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.to')}:</strong>{formatDate(item.toDate ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.type_leave')}:</strong> {lang == 'vi' ? item?.typeLeaveName : item?.typeLeaveNameE}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.time_leave')}:</strong> {lang == 'vi' ? item?.timeLeaveName : item?.timeLeaveNameE}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.reason')}:</strong> {item?.reason}</div>
                                            <div className="mb-1"><strong>{t('list_leave_request.write_leave_name')}:</strong> {item?.userNameCreatedForm}</div>
                                            <div className="mb-1"><strong>
                                                {t('list_leave_request.status')}: </strong> 
                                                <StatusLeaveRequest 
                                                    status={item.requestStatusId == 1 ? 'Pending' : item.requestStatusId == 3 ? 'Completed' : item.requestStatusId == 5 ? 'Reject' : 'In Process'}
                                                />
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