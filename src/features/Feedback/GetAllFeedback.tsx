/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import feedbackApi from "@/api/feedbackApi"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/time"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { Label } from "@/components/ui/label"

export default function AllFeedback () {
    const { t } = useTranslation();
    const { t:tCommon} = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]

    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [status, setStatus] = useState(0)

    
    const { data: allFeedbacks = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-feedback', { page, pageSize, status }],
        queryFn: async () => {
            const res = await feedbackApi.getAllFeedback({page, pageSize, status})
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
                <h3 className="font-bold text-xl md:text-2xl m-0">{lang == 'vi' ? 'Tất cả thư góp ý' : 'All feedback'}</h3>
            </div>

            <div className="mt-2 flex mb-5">
				<div className="w-[12%] min-w-[250px]">
					<Label className="mb-2">{lang == 'vi' ? 'Trạng thái' : 'Status'}</Label>
					<select
						value={status}
					    onChange={(e) => setStatus(e.target.value != '' ? Number(e.target.value) : 0)}
						className="border p-1 rounded w-full cursor-pointer"
					>
						<option value="0">{lang == "vi" ? "Tất cả" : "All"}</option>
                        <option value="1">{lang == "vi" ? "Chưa phản hồi" : "Pending response"}</option>
                        <option value="2">{lang == "vi" ? "Đã phản hồi" : "Responsed"}</option>
					</select>
				</div>
			</div>

            
            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.code')}</th>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.content')}</th>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.status')}</th>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.created_at')}</th>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('feedback.list.action')}</th>
                                </tr>
                            </thead>
                        <tbody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={index}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <td key={i} className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                        ))}
                                    </tr>
                                    ))
                                ) : isError || allFeedbacks.length == 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-2 text-center font-bold text-red-700">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    allFeedbacks.map((item: any, idx: number) => {
                                        return (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 border text-center">
                                                    <Link to={`/feedback/view/${item?.code ?? '1'}`} className="text-blue-700 underline">{item?.code ?? '--'}</Link>
                                                </td>
                                                <td className="px-4 py-2 border text-center whitespace-normal break-words w-[230px]">{item?.content ?? '--'}</td>
                                                <td className={`font-bold px-4 py-2 border text-center ${item?.status == 1 ? 'text-gray-600' : 'text-green-600'}`}>
                                                    {item?.status == 1 ? t('feedback.list.pending_response') : t('feedback.list.has_response')}
                                                </td>
                                                <td className="px-4 py-2 border text-center">
                                                    {formatDate(item?.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                                                </td>
                                                <td className="px-4 py-2 border text-center">
                                                    {
                                                        item?.status == 1 && 
                                                        <Link to={`/feedback/view/${item?.code}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                            {lang == 'vi' ? 'Phản hồi' : 'Response'}
                                                        </Link>
                                                    }
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
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                </div>
                            ))
                        ) : isError || allFeedbacks.length === 0 ? (
                            <div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? tCommon('no_results')}</div>
                        ) : (
                            allFeedbacks.map((item: any) => (
                                <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                    <div className="mb-1">
                                        <strong>{t('feedback.list.code')}: </strong>
                                        <Link to={`/feedback/view/${item?.code ?? '1'}`} className="text-blue-700 underline font-semibold">{item?.code ?? '--'}</Link>
                                    </div>
                                    <div className="mb-1"><strong>{t('feedback.list.content')}: </strong> {item?.content ?? '--'}</div>
                                    <div className="mb-1"><strong>{t('feedback.list.status')}: </strong> {item?.status == 1 ? t('feedback.list.pending_response') : t('feedback.list.has_response')}</div>
                                    <div className="mb-1"><strong>{t('feedback.list.created_at')}:</strong> {formatDate(item?.createdAt, 'yyyy-MM-dd HH:mm:ss')}</div>
                                    <div className="mb-1">
                                        {
                                            item?.status == 1 && 
                                            <Link to={`/feedback/view/${item?.code}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                {lang == 'vi' ? 'Phản hồi' : 'Response'}
                                            </Link>
                                        }
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {
                allFeedbacks.length > 0 ? (<PaginationControl
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