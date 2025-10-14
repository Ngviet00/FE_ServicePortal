/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { STATUS_ENUM } from "@/lib"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import purchaseApi, { useDeletePurchase } from "@/api/purchaseApi"

export default function ListFormPurchase () {
    const { t } = useTranslation('purchase');
    const { t:tCommon} = useTranslation('common');
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    
    const { data: purchases = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-purchase', { page, pageSize }],
        queryFn: async () => {
            const res = await purchaseApi.getAll({UserCode: user?.userCode ?? "", Page: page, PageSize: pageSize });
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
            queryClient.invalidateQueries({ queryKey: ['get-all-purchase']});
        }
    }

    const delPurchaseForm = useDeletePurchase(); 
    const handleDelete = async (id: string) => {
        const shouldGoBack = purchases.length === 1;
        await delPurchaseForm.mutateAsync(id);
        handleSuccessDelete(shouldGoBack);
        queryClient.invalidateQueries({ queryKey: ['count-wait-approval-sidebar'] })
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('list.title')}</h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/purchase/create">{t('list.btn_create')}</Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('list.code')}</th>
                                    <th className="px-4 py-2 border w-[120px] text-center">{t('list.user_requestor')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.department')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.created_at')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.status')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.action')}</th>
                                </tr>
                            </thead>
                        <tbody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={index}>
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <td key={i} className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                        ))}
                                    </tr>
                                    ))
                                ) : isError || purchases.length == 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-2 text-center font-bold text-red-700">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    purchases.map((item: any) => {
                                        let status = item.requestStatusId;
                                        
                                        if (item?.requestStatusIdPurchase > 0 ) {
                                            status = item?.requestStatusIdPurchase
                                        }

                                        return (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 border text-center">
                                                    <Link to={`/view/purchase/${item?.code ?? '1'}`} className="text-blue-700 underline">{item?.code ?? '--'}</Link>
                                                </td>
                                                <td className="px-4 py-2 border text-center">{item?.userNameCreatedForm ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">{item?.departmentName ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">{formatDate(item?.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
                                                <td className="px-4 py-2 border text-center">
                                                    <StatusLeaveRequest status={status}
                                                />
                                                </td>
                                                <td className="text-center border font-bold text-red-700">
                                                    {
                                                        item?.requestStatusId == STATUS_ENUM.PENDING ? (
                                                            <>
                                                                <Link to={`/purchase/edit/${item?.code}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                                    {t('list.edit')}
                                                                </Link>
                                                                <ButtonDeleteComponent id={item?.code} onDelete={() => handleDelete(item.code ?? '')}/>
                                                            </>
                                                        ) : (<>--</>)
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
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                </div>
                            ))
                        ) : isError || purchases.length === 0 ? (
                            <div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
                        ) : (
                            purchases.map((item: any) => (
                                <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                    <div className="mb-1"><strong>{t('list.code')}: </strong> 
                                        <Link to={`/view/purchase/${item?.code ?? '1'}`} className="text-blue-700 underline">{item?.code ?? '--'}</Link>
                                    </div>
                                    <div className="mb-1"><strong>{t('list.user_requestor')}:</strong> {item?.userNameCreatedForm ?? '--'}</div>
                                    <div className="mb-1"><strong>{t('list.department')}:</strong> {item?.departmentName }</div>
                                    <div className="mb-1"><strong>{t('list.created_at')}:</strong> {formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                    <div className="mb-1"><strong>{t('list.status')}:</strong> <StatusLeaveRequest status={item?.requestStatusId}/></div>
                                    <div className="mb-1">
                                        {
                                            item?.requestStatusId == STATUS_ENUM.PENDING ? (
                                                <>
                                                    <Link to={`/purchase/edit/${item?.code}`} className="bg-black text-white px-[10px] py-[4px] rounded-[3px] text-sm">
                                                        {t('list.edit')}
                                                    </Link>
                                                    <ButtonDeleteComponent id={item?.code} onDelete={() => handleDelete(item?.code ?? '')}/>
                                                </>
                                            ) : (<>--</>)
                                        }
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {
                purchases.length > 0 ? (<PaginationControl
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