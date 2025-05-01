import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDate, ShowToast, useDebounce } from "@/lib"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import userApi, { ListUserData } from "@/api/userApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ListUser () {
    const [name, setName] = useState("") //search by name
    const [totalPage, setTotalPage] = useState(0) //search by name
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(10) //per page 5 item

    const queryClient = useQueryClient();

    const debouncedName = useDebounce(name, 300);
    
    //get list users 
    const { data: users = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-user', debouncedName, page, pageSize],
        queryFn: async () => {
            await delay(Math.random() * 100 + 100);
            const res = await userApi.getAll({
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
            queryClient.invalidateQueries({ queryKey: ['get-all-user'] });
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
        mutationFn: async (id: string) => {
            await userApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Success", "success");
        },
        onError: (error) => {
            console.error("Delete failed:", error);
            ShowToast("Delete failed", "error");
        }
    });

    const handleDelete = async (id: string) => {
        try {
            const shouldGoBack = users.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">User</h3>
                <Button>
                    <Link to="/user/create">Create User</Link>
                </Button>
            </div>

            <div className="flex items-center justify-start">
                <div className="w-[17%]">
                    <Input
                        placeholder="Tìm kiếm tên, email, số điện thoaị..."
                        value={name}
                        onChange={handleSearchByName}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px] text-center">User Code</TableHead>
                                <TableHead className="w-[180px] text-center">Name</TableHead>
                                <TableHead className="w-[130px] text-center">Department</TableHead>
                                <TableHead className="w-[100px] text-center">Position</TableHead>
                                <TableHead className="w-[150px] text-center">Sex</TableHead>
                                <TableHead className="w-[150px] text-center">Phone</TableHead>
                                <TableHead className="w-[120px] text-center">Email</TableHead>
                                <TableHead className="w-[120px] text-center">Level</TableHead>
                                <TableHead className="w-[120px] text-center">Level Parent</TableHead>
                                <TableHead className="w-[150px] text-center">Date join company</TableHead>
                                <TableHead className="w-[120px] text-center">Action</TableHead>
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
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[200px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                    </TableRow>
                                ))
                            ) : isError || users.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={11}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) : (
                                users.map((item: ListUserData) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-center">{item?.code}</TableCell>
                                            <TableCell className="text-center">{item?.name}</TableCell>
                                            <TableCell className="text-center">{item?.department?.name ?? "--"}</TableCell>
                                            <TableCell className="text-center">{item.position ? item.position : "--"}</TableCell>
                                            <TableCell className="text-center">{item?.sex == 1 ? "Nam" : "Nữ"}</TableCell>
                                            <TableCell className="text-center">{item.phone ? item.phone : "--"}</TableCell>
                                            <TableCell className="text-center">{item?.email}</TableCell>
                                            <TableCell className="text-center">{item?.level}</TableCell>
                                            <TableCell className="text-center">{item?.level_parent ?? "--"}</TableCell>
                                            <TableCell className="text-center">{formatDate(item?.date_join_company ?? "", "dd/MM/yyyy")}</TableCell>
                                            <TableCell className="text-center">
                                                <ButtonDeleteComponent id={item.code} onDelete={() => handleDelete(item.id)}/>
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
                users.length > 0 ? (<PaginationControl
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