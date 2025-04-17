import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import DeleteRoleComponent from "./components/DeleteRoleComponent"
import roleApi from "@/api/roleApi"
import CreateRoleComponent from "./components/CreateRoleComponent"
import UpdateRoleComponent from "./components/UpdateRoleComponent"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { debounce } from "lodash";
import React from "react"

type Role = {
    id: number;
    name: string;
};

export default function ListRole () {
    const [filter, setFilter] = useState("");
    const [debouncedFilter, setDebouncedFilter] = useState(filter);

    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await roleApi.getAll({
                page: currentPage,
                page_size: pageSize,
                name: debouncedFilter,
            });
            setRoles(res.data.data);
            setTotalPages(res.data.total_pages);
            setError(null);
        } catch (error) {
            console.error("error get list role:", error);
            setError("Cannot load data, server error");
        } finally {
            setTimeout(() => setLoading(false), 100);
        }
    }, [currentPage, pageSize, debouncedFilter]);

    const handleFindRoleName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCurrentPage(1)
        setFilter(value);
        debounceFilter(value);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debounceFilter = useCallback(
        debounce((val: string) => {
            setDebouncedFilter(val);
        }, 300),
        []
    );

    const handlePageSizeChange = (perpage: number) => {
        setPageSize(perpage)
        setCurrentPage(1)
    }

    useEffect(() => {
        return () => {
            debounceFilter.cancel();
        };
    }, [debounceFilter]);

    useEffect(() => {
        
        getRoles();
        
    }, [getRoles]);

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Roles</h3>
                <CreateRoleComponent onSuccess={getRoles}/>
            </div>

            <div className="flex items-center justify-between">
                <Input
                    placeholder="Tìm kiếm role..."
                    value={filter}
                    onChange={handleFindRoleName}
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
                            <th scope="col" className="w-[75%] px-6 py-3 bg-gray-50 dark:bg-gray-700">Name</th>
                            <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            Array.from({ length: pageSize }).map((_, index) => ( // Bạn có thể thay 5 bằng số cố định hoặc roles.length tuỳ mục đích
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-[57px] p-4">
                                        <Skeleton className="h-4 w-[15px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[250px]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-[80px]" />
                                    </td>
                                </tr>
                            ))
                        ) : error || roles.length === 0 ? (
                            <tr className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <td colSpan={3} className={`text-center py-4 font-bold ${error ? 'text-red-700' : 'text-black'}`}>
                                    {error || "No results"}
                                </td>
                            </tr>
                        ) : (
                            roles.map((role, index) => (
                                <tr key={index} className="h-[57px] bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-opacity duration-300 opacity-0 animate-fade-in">
                                    <td className="p-4 w-[57px]">
                                        <Checkbox className="hover:cursor-pointer" />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {role.name}
                                    </th>
                                    <td className="flex items-center px-4 py-4">
                                        <UpdateRoleComponent role={role} onSuccess={getRoles} />
                                        <DeleteRoleComponent role={role} onSuccess={getRoles} />
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
            {
                roles.length > 0 ? (<PaginationControl
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                />) : (null)
            }
        </div>
    )
}