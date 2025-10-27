/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import missTimeKeepingApi from "@/api/missTimeKeepingApi"

export default function ListMyMissTimeKeeping () {
    const { t } = useTranslation('hr')
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [status, setStatus] = useState('')
    const {user} = useAuthStore()
    
    const { data: myMissTimeKeepings = [], isPending, isError, error } = useQuery({
        queryKey: ['get-my-miss-timekeeping', { page, pageSize, status: status }],
        queryFn: async () => {
            const res = await missTimeKeepingApi.getMyMissTimeKeeping({
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
                    {t('miss_timekeeping.list.title')}
                </h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/miss-timekeeping/create">
                        {lang == 'vi' ? 'Tạo đơn bù chấm công' : 'Create miss timekeeping'}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mb-2">
                    <Label className="mb-2">{t('miss_timekeeping.list.status')}</Label>
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
                        <table className="min-w-full table-fixed text-sm border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100 rounded-t-lg">
                                <tr>
                                    <th rowSpan={2} className="px-4 py-2 border w-[100px]">{ t('miss_timekeeping.list.code')}</th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[80px]">{ t('miss_timekeeping.list.usercode')}</th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[150px]">{t('miss_timekeeping.list.username')}</th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[90px]">{t('miss_timekeeping.list.date')}</th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[80px]">{t('miss_timekeeping.list.shift')}</th>
                                    <th colSpan={2} className="px-4 py-2 border w-[180px]">{t('miss_timekeeping.list.additional')}</th>
                                    <th colSpan={2} className="px-4 py-2 border text-center w-[200px]">{t('miss_timekeeping.list.facial_recognition')}</th>
                                    <th colSpan={2} className="px-4 py-2 border w-[150px]">{t('miss_timekeeping.list.gate')}</th>
                                    <th rowSpan={2} className="px-4 py-2 border">{t('miss_timekeeping.list.reason')}</th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[150px]">{t('miss_timekeeping.list.created_at')}</th>
                                    <th rowSpan={2} className="px-4 py-2 border w-[150px]">{t('miss_timekeeping.list.status')}</th>
                                </tr>
                                <tr>
                                    <th className="py-1 border-r  border-b w-[30px]">{t('miss_timekeeping.list.in')}</th>
                                    <th className="border-r border-b w-[30px]">{t('miss_timekeeping.list.out')}</th>
                                    <th className="border-r border-b w-[30px]">{t('miss_timekeeping.list.in')}</th>
                                    <th className="border-r border-b w-[30px]">{t('miss_timekeeping.list.out')}</th>
                                    <th className="border-r border-b w-[30px]">{t('miss_timekeeping.list.in')}</th>
                                    <th className="w-[30px] border-b">{t('miss_timekeeping.list.out')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    isPending ? (
                                        Array.from({ length: 3 }).map((_, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                                <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[40px] bg-gray-300" /></div></td>
                                            </tr>  
                                        ))
                                    ) : isError || myMissTimeKeepings.length == 0 ? (
                                        <tr>
                                            <td colSpan={14} className="px-4 py-2 text-center font-bold text-red-700">
                                                { error?.message ?? tCommon('no_results') } 
                                            </td>
                                        </tr>
                                    ) : (
                                        myMissTimeKeepings?.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="border px-2 py-2 text-center">
                                                    <Link to={`/view/miss-timekeeping/${item?.code}`} className="underline text-blue-600">{item?.code}</Link>
                                                </td>
                                                <td className="border px-2 py-2 text-center">{item?.userCode}</td>
                                                <td className="border px-2 py-2 text-center">{item?.userName}</td>
                                                <td className="border px-2 py-2 text-center">{formatDate(item?.dateRegister ?? '', 'yyyy-MM-dd')}</td>
                                                <td className="border px-2 py-2 text-center">{item?.shift}</td>
                                                <td className="border px-2 py-2 text-center">{item?.additionalIn}</td>
                                                <td className="border px-2 py-2 text-center">{item?.additionalOut}</td>
                                                <td className="border px-2 py-2 text-center">{item?.facialRecognitionIn}</td>
                                                <td className="border px-2 py-2 text-center">{item?.facialRecognitionOut}</td>
                                                <td className="border px-2 py-2 text-center">{item?.gateIn}</td>
                                                <td className="border px-2 py-2 text-center">{item?.gateOut}</td>
                                                <td className="border px-2 py-2 text-center">{item?.reason}</td>
                                                <td className="border px-2 py-2 text-center">{formatDate(item?.createdAt ?? '', 'yyyy-MM-dd HH:mm:ss') }</td>
                                                <td className="border px-2 py-2 text-center">
                                                    <StatusLeaveRequest 
                                                        status={item.requestStatusId == 1 ? 'Pending' : item.requestStatusId == 3 ? 'Completed' : item.requestStatusId == 5 ? 'Reject' : 'In Process'}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                        ))}
                                    </div>
                                ))
                            ) : isError || myMissTimeKeepings.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium dark:text-white mt-5">{ error?.message ?? tCommon('no_results') }</div>
                            ) : (
                                myMissTimeKeepings.map((item: any, idx: number) => {
                                    return (
                                        <div key={idx} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                            <div className="mb-1 font-bold">{item?.userName} ({item?.userCode})</div>
                                            <div className="mb-1">
                                                <strong>{t('miss_timekeeping.list.code')}: </strong>
                                                <Link to={`/view/miss-timekeeping/${item?.code}`} className="text-blue-600 underline">
                                                     {item?.code}
                                                </Link>
                                            </div>
                                            <div className="mb-1"><strong>{t('miss_timekeeping.list.date')}: </strong>{formatDate(item?.dateRegister ?? "", "yyyy-MM-dd")}</div>
                                            <div className="mb-1"><strong>{t('miss_timekeeping.list.shift')}: </strong>{item?.shift}</div>
                                            <div className="mb-1">
                                                <strong>{t('miss_timekeeping.list.additional')}: </strong> 
                                                    {t('miss_timekeeping.list.in')}: {item?.additionalIn ? item?.additionalIn : '--'} ,_____
                                                    {t('miss_timekeeping.list.out')}: {item?.additionalOut ? item?.additionalOut : '--'}
                                            </div>
                                            <div className="mb-1">
                                                <strong>{t('miss_timekeeping.list.facial_recognition')}: </strong> 
                                                    {t('miss_timekeeping.list.in')}: {item?.facialRecognitionIn ? item?.facialRecognitionIn : '--'} ,_____
                                                    {t('miss_timekeeping.list.out')}: {item?.facialRecognitionOut ? item?.facialRecognitionOut : '--'}
                                            </div>
                                            <div className="mb-1">
                                                <strong>{t('miss_timekeeping.list.gate')}: </strong> 
                                                    {t('miss_timekeeping.list.in')}: {item?.gateIn ? item?.gateIn : '--'} ,_____
                                                    {t('miss_timekeeping.list.out')}: {item?.gateOut ? item?.gateOut : '--'}
                                            </div>
                                            <div className="mb-1"><strong>{t('miss_timekeeping.list.reason')}: </strong> {item?.reason}</div>
                                            <div className="mb-1"><strong>{t('miss_timekeeping.list.created_at')}: </strong> {formatDate(item?.createdAt ?? '', 'yyyy-MM-dd HH:mm:ss')}</div>
                                            <div className="mb-1"><strong>
                                                {t('miss_timekeeping.list.status')}: </strong> 
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
                myMissTimeKeepings.length > 0 ? (<PaginationControl
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