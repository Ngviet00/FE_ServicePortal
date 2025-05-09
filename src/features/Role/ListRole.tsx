import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ShowToast, useDebounce } from "@/lib"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import roleApi, { IRole } from "@/api/roleApi"
import React from "react"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import CreateRoleComponent from "./CreateRoleForm"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ListRole () {
    const [name, setName] = useState("") //search by name
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(20) //per page 5 item

    const queryClient = useQueryClient();
    const debouncedName = useDebounce(name, 300);
    
    //get list roles 
    const { data: roles = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-role', debouncedName, page, pageSize],
        queryFn: async () => {
            await delay(Math.random() * 100 + 100);
            const res = await roleApi.getAll({
                page: page,
                page_size: pageSize,
                name: debouncedName
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedName]);

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-role'] });
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
            await roleApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Delete role success", "success");
        },
        onError: (error) => {
            console.error("Delete failed:", error);
            ShowToast("Delete role failed", "error");
        }
    });

    const handleDelete = async (id: number) => {
        try {
            const shouldGoBack = roles.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };
    
    console.log('render role');

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Roles</h3>
                <CreateRoleComponent onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-role'] })}/>
            </div>

            <div className="flex items-center justify-between">
                <Input
                    placeholder="Tìm kiếm role..."
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
                                <TableHead className="w-[20px] text-left">ID</TableHead>
                                <TableHead className="w-[50px] text-left">Name</TableHead>
                                <TableHead className="w-[50px] text-left">Code</TableHead>
                                <TableHead className="w-[100px] text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="w-[20px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-right"><div className="flex justify-end"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center"/></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : isError || roles.length == 0 ? (
                                    <TableRow>
                                        <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={4}>{error?.message ?? "No results"}</TableCell>
                                    </TableRow>
                                ) : (
                                    roles.map((item: IRole) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-left">{item?.id}</TableCell>
                                            <TableCell className="font-medium text-left">{item?.name}</TableCell>
                                            <TableCell className="font-medium text-left">{item?.code}</TableCell>

                                            <TableCell className="text-right">
                                                <CreateRoleComponent role={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-role'] })}/>
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
                roles.length > 0 ? (<PaginationControl
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