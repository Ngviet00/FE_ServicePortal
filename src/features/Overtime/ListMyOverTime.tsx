/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
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
                <Button asChild className="w-full md:w-auto">
                    <Link to="/overtime/create">
                        {t('overtime.create.title_create')}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f3f4f6] border">
                                    <TableHead className="w-[100px] text-center border">{t('overtime.list.code')}</TableHead>
                                    <TableHead className="w-[100px] text-center border">{t('overtime.list.usercode')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('overtime.list.username')}</TableHead>
                                    <TableHead className="w-[130px] text-center border">{t('overtime.list.position')}</TableHead>
                                    <TableHead className="w-[100px] text-center border">{t('overtime.list.date_register')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('overtime.list.type_overtime')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('overtime.list.from_hour')}</TableHead>
                                    <TableHead className="w-[120px] text-center border">{t('overtime.list.to_hour')}</TableHead>
                                    <TableHead className="w-[120px] text-center border">{t('overtime.list.number_hour')}</TableHead>
                                    <TableHead className="w-[120px] text-center border">{t('overtime.list.note')}</TableHead>
                                    <TableHead className="w-[120px] text-center border">{t('overtime.list.created_at')}</TableHead>
                                    <TableHead className="w-[200px] text-center border">{t('overtime.list.status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 1 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <TableCell key={i}>
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                </div>
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                ) : isError || myOverTimes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-red-700 border text-center font-medium dark:text-white">
                                            { error?.message ?? tCommon('no_results') } 
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    myOverTimes.map((item: any, idx: number) => {
                                        const infoOverTime = JSON.parse(item?.metaData ?? '{}');
                                        let status = null

                                        if (item?.applicationFormItemStatus == false) {
                                            status = StatusApplicationFormEnum.Reject
                                        } else {
                                            status = item.requestStatusId == StatusApplicationFormEnum.Pending ? 'Pending' 
                                                    : item.requestStatusId == StatusApplicationFormEnum.Complete ? 'Completed' 
                                                    : item.requestStatusId == StatusApplicationFormEnum.Reject ? 'Reject' : 'In Process'
                                        }

                                        return (
                                            <TableRow key={idx}>
                                                <TableCell className="text-center border">
                                                    <Link to={`/view/${item?.applicationFormCode}?requestType=${item?.requestTypeId}`} className="text-blue-600 underline">{item?.applicationFormCode}</Link>
                                                </TableCell>
                                                <TableCell className="text-center border">{item?.userCode}</TableCell>
                                                <TableCell className="text-center border">{item?.userName}</TableCell>
                                                <TableCell className="text-center border">{item?.position}</TableCell>
                                                <TableCell className="text-center border">{formatDate(infoOverTime?.date_register ?? "", "yyyy-MM-dd") }</TableCell>
                                                <TableCell className="text-center border">{infoOverTime?.type_overtime?.name}</TableCell>
                                                <TableCell className="text-center border">{item?.fromHour}</TableCell>
                                                <TableCell className="text-center border">{item?.toHour}</TableCell>
                                                <TableCell className="text-center border">{item?.numberHour}</TableCell>
                                                <TableCell className="text-center border">{item?.note}</TableCell>
                                                <TableCell className="text-center border">{ formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss") }</TableCell>
                                                <TableCell className="text-center border">
                                                    <StatusLeaveRequest 
                                                        status={status}
                                                    />
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
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                    </div>
                                ))
                            ) : isError || myOverTimes.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium dark:text-white mt-5">{ error?.message ?? tCommon('no_results') }</div>
                            ) : (
                                myOverTimes.map((item: any, idx: number) => {
                                    const infoOverTime = JSON.parse(item?.metaData ?? '{}');

                                    return (
                                        <div key={idx} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
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