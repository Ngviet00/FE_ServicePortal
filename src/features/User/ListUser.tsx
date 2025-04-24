import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDate, ShowToast, useDebounce } from "@/lib"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import userApi, { ListUserData } from "@/api/userApi"

export default function ListUser () {
    const [name, setName] = useState("") //search by name
    const [totalPage, setTotalPage] = useState(0) //search by name
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(5) //per page 5 item

    const queryClient = useQueryClient();

    const debouncedName = useDebounce(name, 300);
    
    //get list users 
    const { data: users = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-user', debouncedName, page, pageSize],
        queryFn: async () => {
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
        mutationFn: async (id: number) => {
            await userApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Delete user success", "success");
        },
        onError: (error) => {
            console.error("Delete failed:", error);
            ShowToast("Delete user failed", "error");
        }
    });

    const handleDelete = async (id: number) => {
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
                <h3 className="font-bold text-2xl m-0 pb-2">Users</h3>
                <Button>
                    <Link to="/user/create">Create User</Link>
                </Button>
            </div>

            <div className="flex items-center justify-start">
                <div className="w-[15%]">
                    <Input
                        placeholder="Tìm kiếm name, email, phone..."
                        value={name}
                        onChange={handleSearchByName}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
            <div className="min-w-[1200px]">
                <table style={{ tableLayout: 'fixed' }} className="text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 w-full">
                        <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                            <tr className="border-b border-gray-200">
                            <th className="w-[3%] p-4 bg-gray-50 dark:bg-gray-700">
                                <div className="flex items-center">
                                    <Checkbox className="hover:cursor-pointer" />
                                </div>
                            </th>
                            <th className="w-[12%] px-6 py-3">Code</th>
                            <th className="w-[22%] px-6 py-3">Name</th>
                            <th className="w-[10%] px-6 py-3">Sex</th>
                            <th className="w-[15%] px-6 py-3">Phone</th>
                            <th className="w-[30%] px-6 py-3">Email</th>
                            <th className="w-[25%] px-6 py-3">Role</th>
                            <th className="w-[20%] px-6 py-3">Department</th>
                            <th className="w-[20%] px-6 py-3">Child Department</th>
                            <th className="w-[25%] px-6 py-3">Position</th>
                            <th className="w-[30%] px-6 py-3">Date join company</th>
                            <th className="w-[30%] px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {isPending ? (
                            Array.from({ length: pageSize }).map((_, index) => (
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-[57px] p-4">
                                        <Skeleton className="h-4 w-[15px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[90px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="w-[57px] p-4">
                                        <Skeleton className="h-4 w-[15px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[90px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                </tr>
                            ))
                        ) : isError || users.length === 0 ? (
                            <tr className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <td colSpan={12} className={`text-center py-4 font-bold ${isError ? 'text-red-700' : 'text-black'}`}>
                                    {error?.message || "No results"}
                                </td>
                            </tr>
                        ) : (
                            users.map((item: ListUserData, index: number) => (
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-opacity duration-300 opacity-0 animate-fade-in">
                                    <td className="p-4 w-[57px]">
                                        <Checkbox className="hover:cursor-pointer" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.code}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.name}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item?.sex == 1 ? "Nam" : "Nữ"}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item?.phone}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item?.email}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.role.name}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.parent_department.name}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item?.children_department ? item.children_department.name : "-" }
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.position.name}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item?.date_join_company ? formatDate(item?.date_join_company) : "-"}
                                    </th>
                                    <td className="px-4 py-4">  
                                        {/* <Link to={`/user/edit/${item.code}`}>Edit</Link> */}
                                        <ButtonDeleteComponent id={item.code} onDelete={() => handleDelete(parseInt(item.code))}/>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
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
