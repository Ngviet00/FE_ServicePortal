import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage, ShowToast, useDebounce } from "@/lib"
import roleApi, { IRole } from "@/api/roleApi"
import React from "react"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import CreateRoleComponent from "./CreateRoleForm"
import { useTranslation } from "react-i18next"

export default function ListRole () {
    const { t } = useTranslation();
    const { t: tCommon } = useTranslation('common')
    const [name, setName] = useState("")
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const queryClient = useQueryClient();
    const debouncedName = useDebounce(name, 300);
    
    const { data: roles = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-role', debouncedName, page, pageSize],
        queryFn: async () => {
            const res = await roleApi.getAll({
                page: page,
                pageSize: pageSize,
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
            ShowToast("Success");
        },
        onError: (error) => {
            ShowToast(getErrorMessage(error), "error");
        }
    });

    const handleDelete = async (id: number) => {
        try {
            const shouldGoBack = roles.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 list-role">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('list_role_page.title')}</h3>
                <CreateRoleComponent onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-role'] })}/>
            </div>

            <div className="flex items-center justify-between">
                <Input
                    placeholder={t('list_role_page.search')}
                    value={name}
                    onChange={handleSearchByName}
                    className="max-w-sm"
                />
            </div>

            <div className="mt-5">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border w-[70px]">STT</th>
                                <th className="px-4 py-2 border w-[400px]">{t('list_role_page.name')}</th>
                                <th className="px-4 py-2 border w-[300px]">{t('list_role_page.code')}</th>
                                <th className="px-4 py-2 border">{t('list_role_page.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[30px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                        </tr>  
                                    ))
                                ) : isError || roles.length == 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-2 text-center font-bold text-red-700">
                                            { error?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    roles?.map((item: IRole, idx: number) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                {(page - 1) * pageSize + idx + 1}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.code}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                <CreateRoleComponent role={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-role'] })}/>
                                                <ButtonDeleteComponent id={item?.id} onDelete={() => handleDelete(item.id)}/>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
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