import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
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
import { ENUM_TIME_LEAVE, ENUM_TYPE_LEAVE, formatDate, getEnumName, ShowToast } from "@/lib"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ListLeaveRequestWaitApproval () {
    const [loading, setLoading] = useState(false)
    const [totalPage, setTotalPage] = useState(0) //search by name
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(10) //per page 5 item

    const queryClient = useQueryClient();

    const [showConfirm, setShowConfirm] = useState(false);

    const {user} = useAuthStore()
    
    const { data: leaveRequests = [], isPending, isError, error } = useQuery({
        queryKey: ['get-leave-request-wait-approval', page, pageSize],
        queryFn: async () => {
            await delay(Math.random() * 100 + 100);
            const res = await leaveRequestApi.getLeaveRequestWaitApproval({
                page: page,
                page_size: pageSize,
                position_id: user?.position?.id
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
        mutationFn: async ({ item, approval }: { item: LeaveRequestData; approval: boolean }) => {
        console.log(user?.code, item?.id, approval, 22222);

          await leaveRequestApi.approvalLeaveRequest({
            user_code_approval: user?.code ?? "",
            leave_request_id: item?.id ?? "",
            status: approval
          });
        },
        
        onSuccess: () => {
            ShowToast("Success", "success");
            setShowConfirm(false)
        },
        onError: (error) => {
            console.error("Failed:", error);
            ShowToast("Failed", "error");
        }
    });

    const handleConfirm = async (item: LeaveRequestData, approval: boolean) => {
        setLoading(true);
        try {
            const shouldGoBack = leaveRequests.length === 1;
            await mutation.mutateAsync({ item, approval });
            handleApproval(shouldGoBack);
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">List request wait approval</h3>
            </div>

            <div className="mb-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px] text-center">User Code</TableHead>
                                <TableHead className="w-[180px] text-center">Name</TableHead>
                                <TableHead className="w-[130px] text-center">Department</TableHead>
                                <TableHead className="w-[100px] text-center">Position</TableHead>
                                <TableHead className="w-[150px] text-center">From</TableHead>
                                <TableHead className="w-[150px] text-center">To</TableHead>
                                <TableHead className="w-[120px] text-center">Type leave</TableHead>
                                <TableHead className="w-[120px] text-center">Time leave</TableHead>
                                <TableHead className="w-[200px] text-center">Reason</TableHead>
                                <TableHead className="w-[50px] text-center">Created at</TableHead>
                                <TableHead className="w-[50px] text-center">Approval</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            { isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[180px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[130px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[100px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[150px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[150px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[200px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[50px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[50px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                    </TableRow>
                                    ))
                            ) : isError || leaveRequests.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={11}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) : (
                                leaveRequests.map((item: LeaveRequestData) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-center">{item?.user_code}</TableCell>
                                            <TableCell className="text-center">{item?.name}</TableCell>
                                            <TableCell className="text-center">{item?.department}</TableCell>
                                            <TableCell className="text-center">{item?.position}</TableCell>
                                            <TableCell className="text-center">{formatDate(item?.from_date ?? "", "yyyy/MM/dd HH:mm")}</TableCell>
                                            <TableCell className="text-center">{formatDate(item?.to_date ?? "", "yyyy/MM/dd HH:mm")}</TableCell>
                                            <TableCell className="text-center">{getEnumName(item?.type_leave?.toString() ?? "", ENUM_TYPE_LEAVE)}</TableCell>
                                            <TableCell className="text-center">{getEnumName(item?.time_leave?.toString() ?? "", ENUM_TIME_LEAVE)}</TableCell>
                                            <TableCell className="text-center">{item?.reason}</TableCell>
                                            <TableCell className="text-center">{formatDate(item?.created_at ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>
                                            <TableCell className="text-center">

                                                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="text-xs px-2 bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white">Approval</Button>
                                                    </DialogTrigger>
                                                    
                                                    <DialogContent className="sm:max-w-[50%] h-[550px] flex flex-col">
                                                        <DialogHeader>
                                                            <DialogTitle></DialogTitle>
                                                            <DialogDescription>
                                                                
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="text-xl">
                                                            Ticket: <span className="text-2xl uppercase">{item?.id}</span>
                                                        </div>
                                                        <div className="flex flex-col w-full">
                                                            <div className="w-full mb-2 text-xl">User Code: <span className="pl-2 text-xl font-bold text-red-800">{item?.user_code}</span></div>
                                                            <div className="w-full mb-2 text-xl">Name: <span className="pl-2 text-xl font-bold text-red-800">{item?.name}</span></div>
                                                            <div className="w-full mb-2 text-xl">Department: <span className="pl-2 text-xl font-bold text-red-800">{item?.department}</span></div>
                                                            <div className="w-full mb-2 text-xl">Position: <span className="pl-2 text-xl font-bold text-red-800">{item?.position}</span></div>
                                                            <div className="w-full mb-2 text-xl">From Date: <span className="pl-2 text-xl font-bold text-red-800">{formatDate(item?.from_date ?? "", "yyyy/MM/dd HH:mm")}</span></div>
                                                            <div className="w-full mb-2 text-xl">To Date: <span className="pl-2 text-xl font-bold text-red-800">{formatDate(item?.to_date ?? "", "yyyy/MM/dd HH:mm")}</span></div>
                                                            <div className="w-full mb-2 text-xl">Type Leave: <span className="pl-2 text-xl font-bold">{getEnumName(item?.type_leave?.toString() ?? "", ENUM_TYPE_LEAVE)}</span></div>
                                                            <div className="w-full mb-2 text-xl">Time Leave: <span className="pl-2 text-xl font-bold">{getEnumName(item?.time_leave?.toString() ?? "", ENUM_TIME_LEAVE)}</span></div>
                                                            <div className="w-full mb-2 text-xl">Reason: <span className="pl-2 text-xl font-bold">{item?.reason}</span></div>
                                                            <div className="w-full mb-2 text-xl">Created At: <span className="pl-2 text-xl font-bold">{formatDate(item?.created_at ?? "", "yyyy/MM/dd HH:mm:ss")}</span></div>
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <Button disabled={loading} onClick={() => handleConfirm(item, false)} type="submit" className="mr-7 bg-red-800 hover:cursor-pointer hover:bg-red-900">Reject</Button>
                                                            <Button disabled={loading} onClick={() => handleConfirm(item, true)} type="submit" className="bg-green-800 hover:cursor-pointer hover:bg-green-900">Save changes</Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
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
