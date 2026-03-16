/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import overTimeApi from "@/api/overTimeApi"
import { StatusApplicationFormEnum } from "@/lib"

export default function ListMyOverTime () {
    const { t } = useTranslation('hr')
    const { t: tCommon } = useTranslation('common')
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const {user} = useAuthStore()
    
    const { data: myOverTimes = [], isPending, isError, error } = useQuery({
        queryKey: ['get-my-overtime', { page, pageSize }],
        queryFn: async () => {
            const res = await overTimeApi.getMyOverTime({
                UserCode: user?.userCode ?? "",
                Page: page,
                PageSize: pageSize
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

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {t('overtime.list.title')}
                </h3>
                <Button asChild className="w-full md:w-auto bg-black hover:bg-black text-white">
                    <Link to="/overtime/create">
                        {t('overtime.create.title_create')}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="w-full overflow-x-auto border border-gray-200 rounded-sm hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr className="text-black">
                                    <th className="border-gray-300 w-[100px] px-3 py-2 border text-center font-semibold">{t('overtime.list.code')}</th>
                                    <th className="border-gray-300 w-[100px] px-3 py-2 border text-center font-semibold">{t('overtime.list.usercode')}</th>
                                    <th className="border-gray-300 w-[150px] px-3 py-2 border text-center font-semibold">{t('overtime.list.username')}</th>
                                    <th className="border-gray-300 w-[130px] px-3 py-2 border text-center font-semibold">{t('overtime.list.position')}</th>
                                    <th className="border-gray-300 w-[100px] px-3 py-2 border text-center font-semibold">{t('overtime.list.date_register')}</th>
                                    <th className="border-gray-300 w-[150px] px-3 py-2 border text-center font-semibold">{t('overtime.list.type_overtime')}</th>
                                    <th className="border-gray-300 w-[80px] px-3 py-2 border text-center font-semibold">{t('overtime.list.from_hour')}</th>
                                    <th className="border-gray-300 w-[80px] px-3 py-2 border text-center font-semibold">{t('overtime.list.to_hour')}</th>
                                    <th className="border-gray-300 w-[80px] px-3 py-2 border text-center font-semibold">{t('overtime.list.number_hour')}</th>
                                    <th className="border-gray-300 w-[150px] px-3 py-2 border text-center font-semibold">{t('overtime.list.note')}</th>
                                    <th className="border-gray-300 w-[150px] px-3 py-2 border text-center font-semibold">{t('overtime.list.created_at')}</th>
                                    <th className="border-gray-300 w-[130px] px-3 py-2 border text-center font-semibold">{t('overtime.list.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <td key={i} className="border-gray-300 px-3 py-2 border text-center">
                                                    <div className="flex justify-center">
                                                        <Skeleton className="h-4 w-[80px] bg-gray-300" />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError || myOverTimes.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="px-4 py-4 text-center font-bold text-red-700 border border-gray-300">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    myOverTimes.map((item: any, idx: number) => {
                                        const infoOverTime = JSON.parse(item?.metaData ?? '{}');
                                        let status = null;

                                        if (item?.applicationFormItemStatus == false) {
                                            status = StatusApplicationFormEnum.Reject;
                                        } else {
                                            status = item.requestStatusId == StatusApplicationFormEnum.Pending ? 'Pending' 
                                                : item.requestStatusId == StatusApplicationFormEnum.Complete ? 'Completed' 
                                                : item.requestStatusId == StatusApplicationFormEnum.Reject ? 'Reject' : 'In Process';
                                        }

                                        return (
                                            <tr key={idx} className="hover:bg-gray-50 text-black">
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center font-medium">
                                                    <Link to={`/view/${item?.applicationFormCode}?requestType=${item?.requestTypeId}`} className="text-blue-600 underline">
                                                        {item?.applicationFormCode}
                                                    </Link>
                                                </td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">{item?.userCode}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">{item?.userName}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">{item?.position}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">{formatDate(infoOverTime?.date_register ?? "", "yyyy-MM-dd")}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">{infoOverTime?.type_overtime?.name}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">{item?.fromHour}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">{item?.toHour}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center font-semibold">{item?.numberHour}</td>
                                                <td className="border-gray-300 px-3 py-2 border text-center truncate max-w-[150px]" title={item?.note}>{item?.note || "--"}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">{formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</td>
                                                <td className="border-gray-300 px-3 py-2 border whitespace-nowrap text-center">
                                                    <StatusLeaveRequest status={status} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="block md:hidden space-y-4">
                        {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="border rounded p-4 space-y-2 shadow bg-white ">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                    </div>
                                ))
                            ) : isError || myOverTimes.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium  mt-5">{ error?.message ?? tCommon('no_results') }</div>
                            ) : (
                                myOverTimes.map((item: any, idx: number) => {
                                    const infoOverTime = JSON.parse(item?.metaData ?? '{}');

                                    return (
                                        <div key={idx} className="border rounded p-4 shadow bg-white  mt-5">
                                            <div className="mb-1 font-bold">{item?.userName} ({item?.userCode})</div>
                                            <div className="mb-1">
                                                <strong>{t('overtime.list.code')}: </strong>
                                                <Link to={`/view/${item?.applicationFormCode}?requestType=${item?.requestTypeId}`} className="text-blue-600 underline">
                                                     {item?.applicationFormCode}
                                                </Link>
                                            </div>
                                            <div><strong>{t('overtime.list.position')}: </strong>{item?.position}</div>
                                            <div><strong>{t('overtime.list.date_register')}: </strong>{formatDate(infoOverTime?.date_register ?? "", "yyyy-MM-dd")}</div>
                                            <div><strong>{t('overtime.list.type_overtime')}: </strong>{infoOverTime?.type_overtime?.name}</div>
                                            <div><strong>{t('overtime.list.from_hour')}: </strong>{item?.fromHour}</div>
                                            <div><strong>{t('overtime.list.to_hour')}: </strong>{item?.toHour}</div>
                                            <div><strong>{t('overtime.list.number_hour')}: </strong>{item?.numberHour}</div>
                                            <div><strong>{t('overtime.list.note')}: </strong>{item?.note}</div>
                                            <div><strong>{t('overtime.list.created_at')}: </strong>{formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                            <div className="mb-1"><strong>
                                                {t('overtime.list.status')}: </strong> 
                                                <StatusLeaveRequest 
                                                    status={item.requestStatusId == StatusApplicationFormEnum.Pending 
                                                        ? 'Pending' 
                                                        : item.requestStatusId == StatusApplicationFormEnum.Complete ? 'Completed' 
                                                        : item.requestStatusId == StatusApplicationFormEnum.Reject ? 'Reject' : 'In Process'}
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
                myOverTimes.length > 0 ? (<PaginationControl
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