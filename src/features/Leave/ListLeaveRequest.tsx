import { Skeleton } from "@/components/ui/skeleton"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import leaveRequestApi, { LeaveRequestData } from "@/api/leaveRequestApi"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { ENUM_TIME_LEAVE, ENUM_TYPE_LEAVE, formatDate, getEnumName } from "@/lib"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ListLeaveRequest () {
    const [totalPage, setTotalPage] = useState(0) //search by name
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(10) //per page 5 item
    const [filterStatus, setFilterStatus] = useState(1)
    const [countPending, setCountPending] = useState(0)
    const [countInProcess, setCountInProcess] = useState(0)

    const {user} = useAuthStore()

    const queryParams = useMemo(() => {
        return {
            user_code: user?.code ?? "",
            page: page,
            page_size: pageSize,
            status: filterStatus
        };
      }, [page, pageSize, filterStatus, user?.code]);
    
    const { data: leaveRequests = [], isPending, isError, error, refetch } = useQuery({
        queryKey: ['get-leave-requests', queryParams],
        queryFn: async () => {
            await delay(Math.random() * 100 + 100);
            const res = await leaveRequestApi.getAll(queryParams);
            console.log('call api leave request');
            setTotalPage(res.data.total_pages)
            setCountPending(res.data.count_pending)
            setCountInProcess(res.data.count_in_process)
            return res.data.data;
        },
    });

    // function handleSuccessDelete(shouldGoBack?: boolean) {
    //     if (shouldGoBack && page > 1) {
    //         setPage(prev => prev - 1);
    //     } else {
    //         queryClient.invalidateQueries({ queryKey: ['get-all-department'] });
    //     }
    // }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const handleChangeFilter = (status: string) => {
        setFilterStatus(Number(status));
        refetch();
        // queryClient.invalidateQueries({ queryKey: ['get-leave-requests'] });
    }

    // const mutation = useMutation({
    //     mutationFn: async (id: number) => {
    //         await departmentApi.delete(id);
    //     },
    //     onSuccess: () => {
    //         ShowToast("Delete department success", "success");
    //     },
    //     onError: (error) => {
    //         console.error("Delete failed:", error);
    //         ShowToast("Delete department failed", "error");
    //     }
    // });

    // const handleDelete = async (id: number) => {
    //     try {
    //         const shouldGoBack = departments.length === 1;
    //         await mutation.mutateAsync(id);
    //         handleSuccessDelete(shouldGoBack);
    //     } catch (error) {
    //         console.error("Failed to delete:", error);
    //     }
    // };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">List leave request</h3>
                <Button>
                    <Link to="/leave/create">Create leave request</Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
            
            </div>

            <div className="mb-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px]">
                    {/*   onValueChange={setTab} */}
                    <Tabs defaultValue="1" className="w-full" onValueChange={handleChangeFilter}>
                        <TabsList style={{margin: '0px auto'}} className="mb-5 h-[40px]">
                            <TabsTrigger className="w-[150px] hover:cursor-pointer bg-gray-200 text-gray-600" value="1">
                                Pending
                                {
                                    countPending > 0 ? (
                                        <span className="text-red-500">({countPending})</span>
                                    ) : (<></>)
                                }  
                            </TabsTrigger>
                            <TabsTrigger className="w-[150px] hover:cursor-pointer bg-yellow-200 text-yellow-600" value="2">
                                In-Process
                                {
                                    countInProcess > 0 ? (
                                        <span className="text-red-500">({countInProcess})</span>
                                    ) : (<></>)
                                }  
                            </TabsTrigger>
                            <TabsTrigger className="w-[150px] hover:cursor-pointer bg-green-200 text-green-600" value="3">Complete</TabsTrigger>
                            <TabsTrigger className="w-[150px] hover:cursor-pointer bg-red-200 text-red-600" value="4">Reject</TabsTrigger>
                        </TabsList>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px] text-left">User Code</TableHead>
                                        <TableHead className="w-[150px] text-left">Name</TableHead>
                                        <TableHead className="w-[130px] text-left">Department</TableHead>
                                        <TableHead className="w-[100px] text-left">Position</TableHead>
                                        <TableHead className="w-[150px] text-left">From</TableHead>
                                        <TableHead className="w-[150px] text-left">To</TableHead>
                                        <TableHead className="w-[120px] text-left">Type leave</TableHead>
                                        <TableHead className="w-[120px] text-left">Time leave</TableHead>
                                        <TableHead className="w-[200px] text-center">Reason</TableHead>
                                        <TableHead className="w-[150px] text-center">Register</TableHead>
                                        <TableHead className="w-[120px] text-center">{filterStatus == 4 ? "Reject By" : "Approve By"}</TableHead>
                                        <TableHead className="w-[50px] text-left">{filterStatus == 1 ? "Created at" : filterStatus == 4 ? "Reject At" : "Approved At"}</TableHead>
                                        <TableHead className={`w-[${filterStatus == 4 ? "120px" : "70px"}] text-left`}>
                                            {filterStatus == 4 ? "Reason" : "Status"}
                                        </TableHead>
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
                                                <TableCell className="w-[200px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                                <TableCell className="w-[150px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                                <TableCell className="w-[80px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                                <TableCell className="w-[50px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                                <TableCell className="w-[50px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[50px] bg-gray-300 text-center" /></div></TableCell>
                                            </TableRow>
                                         ))
                                    ) : isError || leaveRequests.length == 0 ? (
                                        <TableRow>
                                            <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={13}>{error?.message ?? "No results"}</TableCell>
                                        </TableRow>
                                    ) : (
                                        leaveRequests.map((item: LeaveRequestData) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium text-left">{item?.user_code}</TableCell>
                                                    <TableCell className="text-left">{item?.name}</TableCell>
                                                    <TableCell className="text-left">{item?.department}</TableCell>
                                                    <TableCell className="text-left">{item?.position}</TableCell>
                                                    <TableCell className="text-left">{formatDate(item?.from_date ?? "", "yyyy/MM/dd HH:mm")}</TableCell>
                                                    <TableCell className="text-left">{formatDate(item?.to_date ?? "", "yyyy/MM/dd HH:mm")}</TableCell>
                                                    <TableCell className="text-left">{getEnumName(item?.type_leave?.toString() ?? "", ENUM_TYPE_LEAVE)}</TableCell>
                                                    <TableCell className="text-left">{getEnumName(item?.time_leave?.toString() ?? "", ENUM_TIME_LEAVE)}</TableCell>
                                                    <TableCell className="text-center">{item?.reason}</TableCell>
                                                    <TableCell className="text-center text-red-800 font-bold">{item?.name_register}</TableCell>
                                                    <TableCell className="text-center text-red-800 font-bold">{item?.approved_by ?? "--"}</TableCell>
                                                    <TableCell className="text-left">{formatDate(item?.created_at ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>
                                                    <TableCell className="text-left">
                                                        {
                                                            filterStatus == 4 ? (
                                                                <span
                                                                    className={`${item.note ? "text-red-500" : "text-black"} font-bold block w-[150px] overflow-hidden text-ellipsis whitespace-nowrap`}
                                                                    title={item?.note ?? ""}
                                                                >
                                                                    {item?.note ? item.note : "--"}
                                                                </span>
                                                            ) : (
                                                                <StatusLeaveRequest status={item.status ? item.status : 1}/>
                                                            )
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )
                                    }
                                </TableBody>
                            </Table>
                    </Tabs>
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