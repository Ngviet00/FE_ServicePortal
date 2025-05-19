import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import leaveRequestApi, { LeaveRequestData } from "@/api/leaveRequestApi"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { ENUM_TIME_LEAVE, ENUM_TYPE_LEAVE, formatDate, getEnumName, getErrorMessage, ShowToast } from "@/lib"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import useHasRole from "@/hooks/HasRole"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ListLeaveRequestWaitApproval () {
    const [loading, setLoading] = useState(false)
    const [totalPage, setTotalPage] = useState(0) //search by name
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(10) //per page 5 item
    const [note, setNote] = useState("");

    const [selectedItem, setSelectedItem] = useState<LeaveRequestData | null>(null);

    const queryClient = useQueryClient();

    const [showConfirm, setShowConfirm] = useState(false);

    const {user} = useAuthStore()
    
    const { data: leaveRequests = [], isPending, isError, error } = useQuery({
        queryKey: ['get-leave-request-wait-approval', page, pageSize],
        queryFn: async () => {
            await delay(Math.random() * 100 + 100);
            const res = await leaveRequestApi.getLeaveRequestWaitApproval({
                page: page,
                pageSize: pageSize,
                positionId: user?.positionId,
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

    function handleApproval(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-leave-request-wait-approval'] });
        }
    }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const mutation = useMutation({
        mutationFn: async ({ item, approval }: { item: LeaveRequestData; approval: boolean, note: string | null }) => {
            await leaveRequestApi.approvalLeaveRequest({
                PositionId: user?.positionId || null,
                NameUserApproval: `name_${user?.userCode}_approval`,
                UserCodeApproval: user?.userCode || null,
                LeaveRequestId: item?.id ?? "",
                Status: approval,
                Note: note,
                UrlFrontEnd: window.location.origin
            });
        },
        
        onSuccess: () => {
            ShowToast("Success", "success");
            setShowConfirm(false)
            queryClient.invalidateQueries({
                queryKey: ['count-wait-approval-leave-request'],
            });
        }
    });

    const handleConfirm = async (item: LeaveRequestData, approval: boolean, note: string | null) => {
        setLoading(true);
        try {
            const shouldGoBack = leaveRequests.length === 1;
            await mutation.mutateAsync({ item, approval, note });
            handleApproval(shouldGoBack);
            setSelectedItem(null)
        } catch (error) {
            ShowToast(getErrorMessage(error), "error", 7000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!showConfirm) {
          setNote("");
        }
      }, [showConfirm]);

    const hasHRRole = useHasRole(['HR', 'HR_Manager']);

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Wait Approval</h3>
            </div>

            <div className="mb-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[600px] overflow-scroll">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px] text-left">User Code</TableHead>
                                <TableHead className="w-[180px] text-left">Name</TableHead>
                                <TableHead className="w-[130px] text-left">Department</TableHead>
                                <TableHead className="w-[100px] text-left">Position</TableHead>
                                <TableHead className="w-[150px] text-left">From</TableHead>
                                <TableHead className="w-[150px] text-left">To</TableHead>
                                <TableHead className="w-[120px] text-left">Type leave</TableHead>
                                <TableHead className="w-[120px] text-left">Time leave</TableHead>
                                <TableHead className="w-[200px] text-left">Reason</TableHead>
                                <TableHead className="w-[80px] text-left">Approve By</TableHead>
                                <TableHead className="w-[50px] text-left">Created at</TableHead>
                                <TableHead className="w-[50px] text-left">Approval</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            { isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[180px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[130px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[150px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[150px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[200px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[50px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[50px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[50px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                    </TableRow>
                                    ))
                            ) : isError || leaveRequests.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`text-red-700 font-medium text-left dark:text-white`} colSpan={12}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) : (
                                leaveRequests.map((item: LeaveRequestData) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-left">{item?.requesterUserCode}</TableCell>
                                            <TableCell className="text-left">{item?.name}</TableCell>
                                            <TableCell className="text-left">{item?.department}</TableCell>
                                            <TableCell className="text-left">{item?.position}</TableCell>
                                            <TableCell className="text-left">{formatDate(item?.fromDate ?? "", "yyyy/MM/dd HH:mm")}</TableCell>
                                            <TableCell className="text-left">{formatDate(item?.toDate ?? "", "yyyy/MM/dd HH:mm")}</TableCell>
                                            <TableCell className="text-left">{getEnumName(item?.typeLeave?.toString() ?? "", ENUM_TYPE_LEAVE)}</TableCell>
                                            <TableCell className="text-left">{getEnumName(item?.timeLeave?.toString() ?? "", ENUM_TIME_LEAVE)}</TableCell>
                                            <TableCell className="text-left">{item?.reason}</TableCell>
                                            <TableCell className="text-left text-red-800 font-bold">{item?.approvalAction?.approverName ?? "--"}</TableCell>
                                            <TableCell className="text-left">{formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>
                                            <TableCell className="text-left">
                                                {
                                                    hasHRRole && item.approvalRequest?.currentPositionId == -10 ? (
                                                        <Button variant="outline" disabled={loading} onClick={() => handleConfirm(item, true, note)} className="text-xs px-2 bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white">
                                                            Đăng ký
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" onClick={() => setSelectedItem(item)} className="text-xs px-2 bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white">
                                                            Approval
                                                        </Button>
                                                    )
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            }
                        </TableBody>
                    </Table>

                    {selectedItem && (
                        <Dialog 
                            open={!!selectedItem} 
                            onOpenChange={(open) => {
                                if (!open) {
                                    setSelectedItem(null)
                                }
                                setNote("")
                            }}>
                            <DialogContent className="sm:max-w-[600px] max-w-full max-h-[90vh] h-auto flex flex-col overflow-auto">
                                <DialogHeader>
                                    <DialogTitle></DialogTitle>
                                    <DialogDescription></DialogDescription>
                                </DialogHeader>
                                    <div className="flex flex-col w-full">
                                        <div className="w-full mb-2 text-xl">User Code: <span className="pl-2 text-xl font-bold text-red-800">{selectedItem?.requesterUserCode}</span></div>
                                        <div className="w-full mb-2 text-xl">Name: <span className="pl-2 text-xl font-bold text-red-800">{selectedItem?.name}</span></div>
                                        <div className="w-full mb-2 text-xl">Department: <span className="pl-2 text-xl font-bold text-red-800">{selectedItem?.department}</span></div>
                                        <div className="w-full mb-2 text-xl">Position: <span className="pl-2 text-xl font-bold text-red-800">{selectedItem?.position}</span></div>
                                        <div className="w-full mb-2 text-xl">From Date: <span className="pl-2 text-xl font-bold text-red-800">{formatDate(selectedItem?.fromDate ?? "", "yyyy/MM/dd HH:mm")}</span></div>
                                        <div className="w-full mb-2 text-xl">To Date: <span className="pl-2 text-xl font-bold text-red-800">{formatDate(selectedItem?.toDate ?? "", "yyyy/MM/dd HH:mm")}</span></div>
                                        <div className="w-full mb-2 text-xl">Type Leave: <span className="pl-2 text-xl font-bold">{getEnumName(selectedItem?.typeLeave?.toString() ?? "", ENUM_TYPE_LEAVE)}</span></div>
                                        <div className="w-full mb-2 text-xl">Time Leave: <span className="pl-2 text-xl font-bold">{getEnumName(selectedItem?.timeLeave?.toString() ?? "", ENUM_TIME_LEAVE)}</span></div>
                                        <div className="w-full mb-2 text-xl">Reason: <span className="pl-2 text-xl font-bold">{selectedItem?.reason}</span></div>
                                        <div className="w-full mb-2 text-xl">Created At: <span className="pl-2 text-xl font-bold">{formatDate(selectedItem?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</span></div>
                                    </div>

                                    <div className="note">
                                        <Label htmlFor="note" className="mb-2">Ghi chú</Label>
                                        <Textarea value={note} onChange={(e) => {setNote(e.target.value)}} placeholder="Nội dung..." id="note" />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button disabled={loading} onClick={() => handleConfirm(selectedItem, false, note)} type="submit" className="mr-7 bg-red-800 hover:cursor-pointer hover:bg-red-900">Reject</Button>
                                        <Button disabled={loading} onClick={() => handleConfirm(selectedItem, true, note)} type="submit" className="bg-green-800 hover:cursor-pointer hover:bg-green-900">Approval</Button>
                                    </div>
                                </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
            {
                leaveRequests.length > 0 ? (<PaginationControl
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
