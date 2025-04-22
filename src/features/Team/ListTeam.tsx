import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ShowToast, useDebounce } from "@/lib"

import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import teamApi from "@/api/teamApi"

interface Teams {
    id: number,
    name: string,
    department_id: number | null,
    departmentDto: {
        id: number,
        name: string
    }
}

export default function ListTeam () {
    const [name, setName] = useState("") //search by name
    const [totalPage, setTotalPage] = useState(0) //search by name
    const [page, setPage] = useState(1) //current page
    const [pageSize, setPageSize] = useState(5) //per page 5 item

    const queryClient = useQueryClient();

    const debouncedName = useDebounce(name, 300);
    
    //get list team 
    const { data: response, isPending, isError, error } = useQuery({
        queryKey: ['get-all-team', debouncedName, page, pageSize],
        queryFn: async () => {
            const res = await teamApi.getAll({
                page: page,
                page_size: pageSize,
                name: debouncedName
            });
            setTotalPage(res.data.total_pages)
            return res.data;
        }
    });

    const teams = response?.data || [];

    useEffect(() => {
        setPage(1);
    }, [debouncedName]);

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-team'] });
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
            await teamApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Delete department success", "success");
        },
        onError: (error) => {
            console.error("Delete failed:", error);
            ShowToast("Delete department failed", "error");
        }
    });

    const handleDelete = async (id: number) => {
        try {
            const shouldGoBack = teams.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Teams</h3>
                <Button>
                    <Link to="/team/create">Create Team</Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <Input
                    placeholder="Tìm kiếm teams..."
                    value={name}
                    onChange={handleSearchByName}
                    className="max-w-sm"
                />
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px] overflow-y-auto">
                    <table style={{ tableLayout:'fixed'}} className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                            <tr className="border-b border-gray-200">
                                <th scope="col" className="w-[5%] p-4 bg-gray-50 dark:bg-gray-700">
                                    <div className="flex items-center">
                                        <Checkbox className="hover:cursor-pointer"/>
                                    </div>
                                </th>
                            <th scope="col" className="w-[25%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Name</th>
                            <th scope="col" className="w-[50%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Department</th>
                            <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-700">Action</th>
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
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                </tr>
                            ))
                        ) : isError || teams.length === 0 ? (
                            <tr className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <td colSpan={4} className={`text-center py-4 font-bold ${isError ? 'text-red-700' : 'text-black'}`}>
                                    {error?.message || "No results"}
                                </td>
                            </tr>
                        ) : (
                            teams.map((item: Teams, index: number) => (
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-opacity duration-300 opacity-0 animate-fade-in">
                                    <td className="p-4 w-[57px]">
                                        <Checkbox className="hover:cursor-pointer" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item.name}
                                    </th>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {item?.departmentDto?.name}
                                    </th>
                                    <td className="px-4 py-4">  
                                        <Link to={`/team/edit/${item.id}`}>Edit</Link>
                                        <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id)}/>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                teams.length > 0 ? (<PaginationControl
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
