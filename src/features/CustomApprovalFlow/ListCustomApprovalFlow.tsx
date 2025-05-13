import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { useEffect, useState } from "react"
import departmentApi from "@/api/departmentApi"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ShowToast } from "@/lib"
import { Skeleton } from "@/components/ui/skeleton"
import customApprovalFlowApi, { ICustomApprovalFlow } from "@/api/customApprovalFlow"

export default function ListCustomApprovalFlow () {
    const [department, setDepartment] = useState("") //search department
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(5) //per page 5 item

    const queryClient = useQueryClient();
    
	const { data: CustomApprovalFlows = [], isPending, isError, error } = useQuery({
		queryKey: ['list-custom-approval-flows', { page, pageSize, department }],
		queryFn: async () => {
			const res = await customApprovalFlowApi.getAll({
                page: page ?? null,
                page_size: pageSize,
                department_id: department ? Number(department) : null
            });
            setTotalPage(res.data.total_pages)
			return res.data.data;
		},
	});

    //get list department
	const { data: departments = [] } = useQuery({
		queryKey: ['departments'],
		queryFn: async () => {
			const res = await departmentApi.getAll({ page: 1, page_size: 100 });
			return res.data.data;
		},
	});

    useEffect(() => {
        setPage(1);
    }, [department]);

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['list-custom-approval-flows'] });
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
        mutationFn: async (id: number) => {
            await customApprovalFlowApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Success", "success");
        },
        onError: (error) => {
            console.error("Failed:", error);
            ShowToast("Failed", "error");
        }
    });

    const handleDelete = async (id: number) => {
        try {
            const shouldGoBack = CustomApprovalFlows.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Tùy chỉnh phê duyệt</h3>
                <Button>
                    <Link to="/approval-flow/create">Create Custom Approval Flow</Link>
                </Button>
            </div>

            <div className="">
                <label htmlFor="department_id" className='mb-1 mr-2'>Chọn bộ phận/phòng ban:</label>
                <select value={department ?? ''} onChange={(e) => {setDepartment(e.target.value)}} name="department_id" id="department_id" className='dark:text-white dark:bg-[#454545] border border-gray-300 px-[20px] py-[5px]'>
                    <option value="">--Chọn--</option>
                    {
                        departments.map((dept: {id: number, name: string}) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))
                    }
                </select>
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-left">ID</TableHead>
                            <TableHead className="w-[100px] text-left">Department</TableHead>
                            <TableHead className="w-[70px] text-left">Type</TableHead>
                            <TableHead className="w-[70px] text-left">From</TableHead>
                            <TableHead className="w-[70px] text-left">To</TableHead>
                            <TableHead className="w-[100px] text-left">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[100px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[70px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[70px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[70px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[10px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                    </TableRow>
                                ))
                            ) : isError || CustomApprovalFlows.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center dark:text-white`} colSpan={6}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) : (
                                CustomApprovalFlows.map((item: ICustomApprovalFlow) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-left">{item?.id}</TableCell>
                                        <TableCell className="font-medium text-left">{item?.department?.name ?? "--"}</TableCell>
                                        <TableCell className="font-medium text-left">{item?.type_custom_approval ?? "--"}</TableCell>
                                        <TableCell className="font-medium text-left">{item?.from ?? "--"}</TableCell>
                                        <TableCell className="font-medium text-left">{item?.to ?? "--"}</TableCell>
                                        <TableCell className="text-left">
                                            <Link to={`/approval-flow/edit/${item.id}`}>Edit</Link>
                                            <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item?.id ?? 0)}/>
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
                CustomApprovalFlows.length > 0 ? (<PaginationControl
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