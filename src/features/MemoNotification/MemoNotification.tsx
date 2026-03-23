/* eslint-disable @typescript-eslint/no-explicit-any */
import memoNotificationApi, { useDeleteMemoNotification } from "@/api/memoNotificationApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/time";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import "./style.css"

export default function MemoNotification () {
    const { t } = useTranslation()
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const { user } = useAuthStore()
    
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const queryClient = useQueryClient();
    const deleteMemoNotify = useDeleteMemoNotification();

    const { data: memoResponse, isPending, isError, error } = useQuery({
        queryKey: ['get-all-memo-notify', page, pageSize],
        queryFn: async () => {
            const res = await memoNotificationApi.getAll({
                Page: page, 
                PageSize: pageSize, 
                UserCode: user?.userCode
            });

            return res.data.data;
        }
    });

    const memoList = memoResponse?.data ?? [];
    const totalPages = memoResponse?.totalPages ?? 0;

    const handleSuccessDelete = (shouldGoBack?: boolean) => {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-memo-notify'] });
        }
    }

    const handleDelete = async (id: string | undefined) => {
        const shouldGoBack = memoList.length === 1;
        await deleteMemoNotify.mutateAsync(id);
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-1 pl-1 pt-0 space-y-4 list-memo-notify">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('memo_notification.list.title_page')}</h3>
                <Button asChild className="w-full sm:w-auto bg-black text-white hover:bg-black">
                    <Link to="/memo-notify/create">{t('memo_notification.list.btn_create_memo_notify')}</Link>
                </Button>
            </div>

            <div className="table-responsive w-full mt-3">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 table-auto border-collapse">
                    <thead className="text-sm text-gray-700 bg-gray-100">
                        <tr>
                            <th className="border-gray-300 text-center px-4 border py-3 min-w-[220px]">{t('memo_notification.list.title')}</th>
                            <th className="border-gray-300 text-center px-4 border py-3 min-w-[150px]">{t('memo_notification.list.department_apply')}</th>
                            <th className="border-gray-300 text-center px-4 border py-3 min-w-[180px]">{t('memo_notification.list.display')}</th>
                            <th className="border-gray-300 text-center px-4 border py-3 min-w-[80px]">{t('memo_notification.list.status')}</th>
                            <th className="border-gray-300 text-center px-4 border py-3 min-w-[120px]">{t('memo_notification.list.created_by')}</th>
                            <th className="border-gray-300 text-center px-4 border py-3 min-w-[150px]">{t('memo_notification.list.created_at')}</th>
                            <th className="border-gray-300 text-center px-4 border py-3 min-w-[140px]">{t('memo_notification.list.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isPending ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <tr key={i} className="bg-white border-b">
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <td key={j} className="p-4 border text-center">
                                            <Skeleton className="h-4 w-full bg-gray-200" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : isError || memoList.length === 0 ? (
                            <tr>
                                <td className="text-red-700 h-[50px] font-medium text-center border" colSpan={7}>
                                    {isError ? (error as any)?.message : tCommon('no_results')}
                                </td>
                            </tr>
                        ) : (
                            memoList.map((item: any) => (
                                <tr key={item.id} className="memo-row bg-white hover:bg-gray-50">
                                    <td className="border-gray-300 text-left border text-black px-4 py-2">
                                        <div 
                                            className="line-clamp-2 break-words overflow-hidden max-w-[300px]"
                                            dangerouslySetInnerHTML={{ __html: item?.title ?? '' }} 
                                        />
                                    </td>
                                    <td className="border-gray-300 text-center border text-black px-4 py-4">
                                        {item.applyAllDepartment 
                                            ? (lang === 'vi' ? 'Tất cả phòng ban' : 'All departments') 
                                            : (item?.departments || '-')}
                                    </td>
                                    <td className="border-gray-300 text-center border text-black px-4 py-4">
                                        {formatDate(item?.fromDate)} - {formatDate(item?.toDate)}
                                    </td>
                                    <td className="border-gray-300 text-center border px-4 py-4 font-bold">
                                        <span className={item?.status ? 'text-green-700' : 'text-red-700'}>
                                            {item?.status ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="border-gray-300 text-center text-black border px-4 py-4">
                                        {item?.userNameCreated}
                                    </td>
                                    <td className="border-gray-300 text-center text-black border px-4 py-4">
                                        {formatDate(item?.createdAt, "yyyy/MM/dd HH:mm:ss")}
                                    </td>
                                    <td className="border-gray-300 border text-black px-4 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button asChild size="sm" variant="outline" className="bg-black text-white hover:bg-gray-800 hover:text-white h-8">
                                                <Link to={`/memo-notify/edit/${item?.id}`}>
                                                    {t('memo_notification.list.edit')}
                                                </Link>
                                            </Button>
                                            <ButtonDeleteComponent id={item?.id} onDelete={() => handleDelete(item?.id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {memoList.length > 0 && (
                <PaginationControl
                    currentPage={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                />
            )}
        </div>
    )
}