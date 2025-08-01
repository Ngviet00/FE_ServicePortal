import memoNotificationApi, { IMemoNotify } from "@/api/memoNotificationApi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table"
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/time";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import "./style.css"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent";

export default function HistoryApprovalNotification () {
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [totalPage, setTotalPage] = useState(0)

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const { data: MemoNotify, isPending, isError, error } = useQuery({
        queryKey: ['get-all-history-approval', page, pageSize],
        queryFn: async () => {
            const res = await memoNotificationApi.getHistoryApproval({Page: page, PageSize: pageSize, currentUserCode: user?.userCode})
            setTotalPage(res.data.total_pages)
            return res.data.data;
        }
    });

    return (
        <div className="p-1 pl-1 pt-0 space-y-4 list-memo-notify">
            <div className="flex flex-wrap justify-between items-center gap-y-2 gap-x-4 mb-1">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('memo_notification.list.history_approval')}</h3>
                <Button asChild className="w-full sm:w-auto">
                    <Link to="/memo-notify/create">{t('memo_notification.list.btn_create_memo_notify')}</Link>
                </Button>
            </div>

            <div className="table-responsive w-full mt-3">
                <Table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 table-auto">
                    <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="pl-4 py-3 min-w-[180px] dark:text-white">{t('memo_notification.list.title')}</th>
                            <th className="px-4 py-3 min-w-[330px]">{t('memo_notification.list.content')}</th>
                            <th className="px-4 py-3 min-w-[160px]">{t('memo_notification.list.department_apply')}</th>
                            <th className="px-4 py-3 min-w-[70px]">{t('memo_notification.list.display')}</th>
                            <th className="px-4 py-3 min-w-[70px]">{t('memo_notification.list.status')}</th>
                            <th className="px-4 py-3 min-w-[100px]">{t('memo_notification.list.created_at')}</th>
                            <th className="px-4 py-3 min-w-[120px]">{t('memo_notification.list.created_by')}</th>
                            <th className="px-4 py-3 min-w-[120px]">{t('memo_notification.list.approved_by')}</th>
                            <th className="px-4 py-3 min-w-[150px]">{t('memo_notification.list.approved_at')}</th>
                            <th className="px-4 py-3 min-w-[100px]">{t('memo_notification.list.note')}</th>
                            <th className="px-4 py-3 min-w-[140px]">{t('memo_notification.list.approval_status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isPending ? (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td data-label="Tiêu đề" className="p-4 dark:text-white"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Nội dung" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Bộ phận áp dụng" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Thời gian hiển thị" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Trạng thái" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Thời gian tạo" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Người tạo" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Người duyệt" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Thời gian duyệt" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Ghi chú" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                                <td data-label="Trạng thái duyệt" className="px-4 py-4"><Skeleton className="h-4 w-[60px] bg-gray-300" /></td>
                            </tr>
                        ) : isError || MemoNotify.length === 0 ? (
                            <tr>
                                <td className={`${isError ? "text-red-700" : "text-black"} h-[35px] font-medium text-center`} colSpan={8}>
                                    {error?.message ?? "No results"}
                                </td>
                            </tr>
                        ) : (
                            MemoNotify.map((item: IMemoNotify, idx: number) => (
                                <tr key={idx} className="pl-0 pt-0 memo-row bg-white border dark:bg-[#1e1e1e69]">
                                    <td data-label="Tiêu đề" className="text-black border-b border-[#b1b1b169] p-4 break-words whitespace-normal dark:text-white">{ item?.title }</td>
                                    <td data-label="Nội dung" className="text-black border-b border-[#b1b1b169] px-4 py-4 dark:text-white break-words whitespace-normal clamp-content" dangerouslySetInnerHTML={{ __html: item?.content ?? '' }}/>
                                    <td data-label="Bộ phận áp dụng" className="text-black border-b border-[#b1b1b169] px-4 py-4 break-words whitespace-normal dark:text-white">{item.applyAllDepartment ? "Tất cả phòng ban" : item?.departmentNames ?? "---"}</td>
                                    <td data-label="Thời gian hiển thị" className="text-black border-b border-[#b1b1b169] px-4 py-4 dark:text-white">{formatDate(item?.fromDate?.toString() ?? "")} - {formatDate(item?.toDate?.toString() ?? "")}</td>
                                    <td data-label="Trạng thái"
                                        className={`text-black border-b border-[#b1b1b169] px-4 py-4 font-bold dark:text-white`}>
                                        <span className={`${item.status ? 'text-green-700' : 'text-red-700'}`}>{item.status ? "Active" : "Deadactive"}</span>
                                    </td>
                                    <td data-label="Thời gian tạo" className="text-black border-b border-[#b1b1b169] dark:text-white px-4 py-4">{formatDate(item?.createdAt?.toString() ?? "", "yyyy/MM/dd HH:mm:ss")}</td>
                                    <td data-label="Người tạo" className="text-black border-b border-[#b1b1b169] dark:text-white px-4 py-4">{item?.createdBy}</td>
                                    <td data-label="Người duyệt" id="td-action" className="dark:text-white px-4 py-4 font-bold text-red-700">
                                        {item?.userApproval ?? "--"}
                                    </td>
                                    <td data-label="Thời gian duyệt" id="td-action" className="text-black dark:text-white px-4 py-4">
                                        {item?.historyApplicationFormCreatedAt ? formatDate(item?.historyApplicationFormCreatedAt, "yyyy/MM/dd HH:mm:ss") : "--"}
                                    </td>
                                    <td data-label="Ghi chú" className="text-black border-b border-[#b1b1b169] dark:text-white px-4 py-4">
                                        {item?.comment && item?.comment != '' ? item?.comment : "--"}
                                    </td>
                                    <td data-label="Trạng thái duyệt" id="td-action" className="text-black dark:text-white px-4 py-4">
                                        <StatusLeaveRequest status={item?.requestStatusId == 6 ? "In Process" : item?.requestStatusId}/>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
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