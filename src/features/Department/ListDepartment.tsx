import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import departmentApi from "@/api/departmentApi"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ShowToast, useDebounce } from "@/lib"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface IDepartments {
    id: number,
    name: string
    parent_id: number | null
    parent: IDepartments
}

export default function ListDepartment () {
    const [name, setName] = useState("") //search by name
    const [totalPage, setTotalPage] = useState(0) //search by name
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(5) //per page 5 item

    const queryClient = useQueryClient();

    const debouncedName = useDebounce(name, 300);
    
    //get list department 
    const { data: Departments = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-department', debouncedName, page, pageSize],
        queryFn: async () => {
            const res = await departmentApi.getAll({
                page: page,
                page_size: pageSize,
                name: debouncedName
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        }
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedName]);

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-department'] });
        }
    }

    const handleSearchByName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
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
            await departmentApi.delete(id);
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
            const shouldGoBack = Departments.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Deparments</h3>
                <Button>
                    <Link to="/department/create">Create Deparment</Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <Input
                    placeholder="Tìm kiếm department..."
                    value={name}
                    onChange={handleSearchByName}
                    className="max-w-sm"
                />
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-left">ID</TableHead>
                            <TableHead className="w-[250px] text-left">Name</TableHead>
                            <TableHead className="w-[200px] text-left">Parent Department</TableHead>
                            <TableHead className="w-[100px] text-left">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[100px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[250px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[200px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[100px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                    </TableRow>
                                ))
                            ) : isError || Departments.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={4}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) : (
                                Departments.map((item: IDepartments) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-left">{item?.id}</TableCell>
                                        <TableCell className="font-medium text-left">{item?.name}</TableCell>
                                        <TableCell className="font-medium text-left">{item?.parent?.name ?? "--"}</TableCell>
                                        
                                        <TableCell className="text-left">
                                            <Link to={`/department/edit/${item.id}`}>Edit</Link>
                                            <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id)}/>
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
                Departments.length > 0 ? (<PaginationControl
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