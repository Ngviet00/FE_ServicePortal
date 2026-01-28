/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import feedbackApi from "@/api/feedbackApi"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/time"
import PaginationControl from "@/components/PaginationControl/PaginationControl"

export default function PendingResponse () {
    const { t } = useTranslation();
    const { t:tCommon} = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]

    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    
    const { data: myFeedbacks = [], isPending, isError, error } = useQuery({
        queryKey: ['get-feedback-pending-response', { page, pageSize }],
        queryFn: async () => {
            const res = await feedbackApi.getFeedbackPendingResponse({page, pageSize})
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('feedback.pending_response.title')}</h3>
            </div>
            
            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.code')}</th>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.content')}</th>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.created_at')}</th>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.action')}</th>
                                </tr>
                            </thead>
                        <tbody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={index}>
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <td key={i} className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                        ))}
                                    </tr>
                                    ))
                                ) : isError || myFeedbacks.length == 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-2 text-center font-bold text-red-700">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    myFeedbacks.map((item: any, idx: number) => {
                                        return (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 border text-center">
                                                    <Link to={`/feedback/view/${item?.code ?? '1'}`} className="text-blue-700 underline">{item?.code ?? '--'}</Link>
                                                </td>
                                                <td className="px-4 py-2 border text-center whitespace-normal break-words w-[260px]">{item?.content ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">
                                                    {formatDate(item?.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                                                </td>
                                                <td className="px-4 py-2 border text-center">
                                                    <Link to={`/feedback/view/${item?.code}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                        {lang == 'vi' ? 'Phản hồi' : 'Response'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {isPending ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                </div>
                            ))
                        ) : isError || myFeedbacks.length === 0 ? (
                            <div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? tCommon('no_results')}</div>
                        ) : (
                            myFeedbacks.map((item: any) => (
                                <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                    <div className="mb-1">
                                        <strong>{t('feedback.list.code')}: </strong>
                                        <Link to={`/feedback/view/${item?.code ?? '1'}`} className="text-blue-700 underline font-semibold">{item?.code ?? '--'}</Link>
                                    </div>
                                    <div className="mb-1"><strong>{t('feedback.list.content')}: </strong> {item?.content ?? '--'}</div>
                                    <div className="mb-1"><strong>{t('feedback.list.created_at')}:</strong> {formatDate(item?.createdAt, 'yyyy-MM-dd HH:mm:ss')}</div>
                                    <div className="mb-1">
                                        <Link to={`/feedback/view/${item?.code}`} className="bg-black text-white px-[10px] py-[5px] rounded-[3px] text-sm">
                                            {lang == 'vi' ? 'Phản hồi' : 'Response'}
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {
                myFeedbacks.length > 0 ? (<PaginationControl
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