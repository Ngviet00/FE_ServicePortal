import memoNotificationApi, { IMemoNotify, IMemoNotifyDepartment, useDeleteMemoNotification } from "@/api/memoNotificationApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/time";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import "./style.css"

export default function MemoNotification () {
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [totalPage, setTotalPage] = useState(0)
    const queryClient = useQueryClient();
    const deleteMemoNotify = useDeleteMemoNotification();

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const { data: MemoNotify, isPending, isError, error } = useQuery({
        queryKey: ['get-all-memo-notify', page, pageSize],
        queryFn: async () => {
            
            const res = await memoNotificationApi.getAll({Page: page, PageSize: pageSize, currentUserCode: user?.userCode})
            setTotalPage(res.data.total_pages)
            return res.data.data;
        }
    });

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-memo-notify'] });
        }
    }

    const handleDelete = async (id: string | undefined) => {
        const shouldGoBack = MemoNotify.length === 1;
        await deleteMemoNotify.mutateAsync(id);
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-1 pl-1 pt-0 space-y-4 list-memo-notify">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('memo_notification.list.title_page')}</h3>
                <Button asChild className="w-full sm:w-auto">
                    <Link to="/memo-notify/create">{t('memo_notification.list.btn_create_memo_notify')}</Link>
                </Button>
            </div>

            <div className="table-responsive w-full mt-3">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
                    <thead className="text-sm text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="pl-4 border py-3 min-w-[220px] dark:text-white">{t('memo_notification.list.title')}</th>
                            <th className="px-4 border py-3 min-w-[320px]">{t('memo_notification.list.content')}</th>
                            <th className="px-4 border py-3 min-w-[150px]">{t('memo_notification.list.department_apply')}</th>
                            <th className="px-4 border py-3 min-w-[60px]">{t('memo_notification.list.display')}</th>
                            <th className="px-4 border py-3 min-w-[60px]">{t('memo_notification.list.status')}</th>
                            <th className="px-4 border py-3 min-w-[100px]">{t('memo_notification.list.created_at')}</th>
                            <th className="px-4 border py-3 min-w-[120px]">{t('memo_notification.list.created_by')}</th>
                            <th className="px-4 border py-3 min-w-[100px]">{t('memo_notification.list.approval_status')}</th>
                            <th className="px-4 border py-3 min-w-[150px]">{t('memo_notification.list.note')}</th>
                            <th className="px-4 border py-3 min-w-[150px]">{t('memo_notification.list.approved_by')}</th>
                            <th className="px-4 border py-3 min-w-[150px]">{t('memo_notification.list.approved_at')}</th>
                            <th className="px-4 border py-3 min-w-[140px]">{t('memo_notification.list.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isPending ? (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td data-label="Tiêu đề" className="p-4 border dark:text-white"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Nội dung" className="px-4 border py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Bộ phận áp dụng" className="px-4 border py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Thời gian hiển thị" className="px-4 border py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Trạng thái" className="px-4 py-4 border"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Thời gian tạo" className="px-4 py-4 border"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Người tạo" className="px-4 py-4 border"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Trạng thái phê duyệt" className="px-4 py-4 border"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Ghi chú" className="px-4 py-4 border"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Người duyệt" className="px-4 py-4 border"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Thời gian duyệt" className="px-4 py-4 border"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Hành động" className="px-4 py-4 border"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                            </tr>
                        ) : isError || MemoNotify.length === 0 ? (
                            <tr>
                                <td className={`${isError ? "text-red-700" : "text-black"} h-[35px] font-medium text-center`} colSpan={12}>
                                    {error?.message ?? "No results"}
                                </td>
                            </tr>
                        ) : (
                            MemoNotify.map((item: IMemoNotify, idx: number) => {
                                const historyApproval = item?.applicationForm?.historyApplicationForms

                                return (
                                    <tr key={idx} className="pl-0 pt-0 memo-row bg-white border dark:bg-[#1e1e1e69]">
                                        <td data-label="Tiêu đề" className="border text-black p-4 break-words whitespace-normal dark:text-white">{ item?.title }</td>
                                        <td data-label="Nội dung" className="border text-black px-4 py-4 dark:text-white break-words whitespace-normal clamp-content border-b-0 border-l-0 border-r-0 border-t-0" dangerouslySetInnerHTML={{ __html: item?.content ?? '' }}/>
                                        <td data-label="Bộ phận áp dụng" className="border text-black px-4 py-4 break-words whitespace-normal dark:text-white">
                                            {item.applyAllDepartment ? "Tất cả phòng ban" : item?.memoNotificationDepartments?.map((dep: IMemoNotifyDepartment) => dep?.orgUnit?.name).join(', ')}
                                        </td>
                                        <td data-label="Thời gian hiển thị" className="border text-black border-b px-4 py-4 dark:text-white">{formatDate(item?.fromDate?.toString() ?? "")} - {formatDate(item?.toDate?.toString() ?? "")}</td>
                                        <td data-label="Trạng thái" className={`text-black border px-4 py-4 font-bold dark:text-white`}>
                                            <span className={`${item?.status ? 'text-green-700' : 'text-red-700'}`}>{item?.status ? "Active" : "Deadactive"}</span>
                                        </td>
                                        <td data-label="Thời gian tạo" className="text-black border dark:text-white px-4 py-4">{formatDate(item?.createdAt?.toString() ?? "", "yyyy/MM/dd HH:mm:ss")}</td>
                                        <td data-label="Người tạo" className="text-black border dark:text-white px-4 py-4">{item?.createdBy}</td>
                                        <td data-label="Trạng thái phê duyệt" className="text-black text-center border-b border-[#b1b1b169] dark:text-white px-4 py-4">
                                            <StatusLeaveRequest status={item?.applicationForm?.requestStatusId == 6 ? "In Process" : item?.applicationForm?.requestStatusId}/>
                                        </td>
                                        <td data-label="Ghi chú" className="text-black border dark:text-white px-4 py-4">
                                            {historyApproval != undefined && historyApproval?.length > 0 && historyApproval[0]?.note != '' ? historyApproval[0]?.note : "--"}
                                        </td>
                                        <td data-label="Người duyệt" className="border dark:text-white px-4 py-4 font-bold text-red-700">
                                            {historyApproval != undefined && historyApproval?.length > 0 ? historyApproval[0]?.userNameApproval : "--"}
                                        </td>
                                        <td data-label="Thời gian duyệt" className="border text-black border-b border-[#b1b1b169] dark:text-white px-4 py-4">
                                            {historyApproval != undefined && historyApproval?.length > 0 ? formatDate(historyApproval[0]?.createdAt, "yyyy/MM/dd HH:mm:ss") : "--"}
                                        </td>
                                        <td data-label="Hành động" id="td-action" className="border text-black dark:text-white px-4 py-4">
                                            <Link
                                                to={`/memo-notify/edit/${item?.id}`}
                                                className="bg-black text-white px-2 py-0.5 rounded-[3px] leading-none text-sm"
                                            >
                                                Edit
                                            </Link>
                                            <ButtonDeleteComponent className="" id={item?.id} onDelete={() => handleDelete(item?.id)} />
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {MemoNotify && MemoNotify.length > 0 ? (
                <PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />
            ) : null}
        </div>
    )
}