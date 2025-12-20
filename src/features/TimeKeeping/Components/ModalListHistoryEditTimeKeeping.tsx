import Modal from "@/components/Modal";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import timekeepingApi, { ListHistoryTimeAttendance, useDeleteHistoryEditTimeKeeping } from "@/api/HR/timeKeepingApi";
import { useAuthStore } from "@/store/authStore";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import { formatDate } from "@/lib/time";
import { useTranslation } from "react-i18next";

interface ModalListHistoryEditTimeKeepingProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalListHistoryEditTimeKeeping: React.FC<ModalListHistoryEditTimeKeepingProps> = ({
    isOpen,
    onClose,
}) => {
    const {user} = useAuthStore()
    const lang = useTranslation().i18n.language.split('-')[0]
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPage, setTotalPage] = useState(0)
    const queryClient = useQueryClient();
    const [listHistories, setlistHistories] = useState([])

    const { isPending, isError, error } = useQuery({
        queryKey: ['get-list-history-time-attendance', page, pageSize],
        queryFn: async () => {
            const res = await timekeepingApi.GetListHistoryEditTimeKeeping({
                UserCodeUpdated: user?.userCode ?? '',
                page: page,
                PageSize: pageSize
            })
            setlistHistories(res.data.data)
            setTotalPage(res.data.total_pages)
            return res.data.data
        },
        enabled: isOpen,
    });

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const deleteHistoryEditTimeKeeping = useDeleteHistoryEditTimeKeeping();
    const handleDelete = async (id: number) => {
        await deleteHistoryEditTimeKeeping.mutateAsync(id)
        queryClient.invalidateQueries({ queryKey: ['get-list-history-time-attendance'] });
        queryClient.invalidateQueries({ queryKey: ['count-history-edit-timekeeping-not-send-hr'] });
        queryClient.invalidateQueries({ queryKey: ['management-timekeeping'] });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="min-w-[80em] min-h-[40em]">
            <h2 className="text-2xl font-semibold mb-2">
                Lịch sử chỉnh sửa
            </h2>
            <div className="my-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px] w-full overflow-x-auto">
                    <Table className="min-w-[1024px] w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-left">Ngày</TableHead>
                                <TableHead className="w-[100px] text-left">Mã nhân viên</TableHead>
                                <TableHead className="w-[100px] text-left">Tên</TableHead>
                                <TableHead className="w-[100px] text-left">Giá trị cũ</TableHead>
                                <TableHead className="w-[100px] text-left">Giá trị mới</TableHead>
                                <TableHead className="w-[100px] text-left">Người cập nhật</TableHead>
                                <TableHead className="w-[100px] text-left">Cập nhật lúc</TableHead>
                                <TableHead className="w-[100px] text-left">Trạng thái</TableHead>
                                <TableHead className="w-[100px] text-center">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300 text-left"/></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300 text-left"/></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300 text-left"/></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : isError || listHistories.length == 0 ? (
                                    <TableRow>
                                        <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center dark:text-white`} colSpan={9}>{error?.message ?? "No results"}</TableCell>
                                    </TableRow>
                                )
                                : 
                                (
                                    listHistories.map((item: ListHistoryTimeAttendance, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium text-left">
                                                {
                                                    item?.datetime ? formatDate(item.datetime, 'yyyy-MM-dd') : ''
                                                }
                                            </TableCell>
                                            <TableCell className="font-medium text-left">{item.userCode}</TableCell>
                                            <TableCell className="font-medium text-left">{item.userName}</TableCell>
                                            <TableCell className="font-medium text-left">{item.oldValue}</TableCell>
                                            <TableCell className="font-medium text-left">{item.currentValue}</TableCell>
                                            <TableCell className="font-medium text-left">{item.updatedBy}</TableCell>
                                            <TableCell className="font-medium text-left">
                                                {
                                                    item?.updatedAt ? formatDate(item.updatedAt, 'yyyy-MM-dd HH:mm:ss') : ''
                                                }
                                            </TableCell>
                                            <TableCell className="font-medium text-left">
                                                {
                                                    item?.isSentToHR == false ? (<span className="bg-gray-300 text-gray-900 p-1 rounded-[3px]">Pending</span>)
                                                    : (<span className="bg-green-300 text-green-900 p-1 rounded-[3px]">Submitted</span>)
                                                }
                                            </TableCell>
                                            <TableCell className="font-medium text-center">
                                                {
                                                    item?.isSentToHR == false ? (
                                                        <button className="bg-black text-white px-3 py-0.5 rounded-[3px] cursor-pointer" onClick={() => handleDelete(item?.id ?? 0)}>{lang == 'vi' ? 'Xóa' : 'Delete'}</button>
                                                    ) : (<span>--</span>)
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
            {
                listHistories.length > 0 ? (<PaginationControl
                    currentPage={page}
                    totalPages={totalPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
        </Modal>
    );
}

export default React.memo(ModalListHistoryEditTimeKeeping);