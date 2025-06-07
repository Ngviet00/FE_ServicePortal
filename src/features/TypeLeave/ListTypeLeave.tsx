import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage, ShowToast, useDebounce } from "@/lib"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import CreateTypeLeaveForm from "./CreateTypeLeaveForm"
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"

export default function ListTypeLeave () {
    const { t } = useTranslation();
    const [page, setPage] = useState(1)
    const queryClient = useQueryClient();
    const debouncedName = useDebounce(name, 300);
    
    //get list type leave 
    const { data: typeLeaves = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-type-leave', debouncedName],
        queryFn: async () => {
            const res = await typeLeaveApi.getAll({ });
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
            queryClient.invalidateQueries({ queryKey: ['get-all-type-leave'] });
        }
    }

    const mutation = useMutation({
        mutationFn: async (id: number) => {
            await typeLeaveApi.delete(id);
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
            const shouldGoBack = typeLeaves.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('type_leave_page.title')}</h3>
                <CreateTypeLeaveForm onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-type-leave'] })}/>
            </div>
            <div className="mb-5 relative shadow-md sm:rounded-lg pb-3">
                <div className="max-h-[450px] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[20px] text-left">ID</TableHead>
                                <TableHead className="w-[50px] text-left">{t('type_leave_page.name')}</TableHead>
                                <TableHead className="w-[50px] text-left">{t('type_leave_page.modified_by')}</TableHead>
                                <TableHead className="w-[50px] text-left">{t('type_leave_page.modified_at')}</TableHead>
                                <TableHead className="w-[100px] text-right">{t('type_leave_page.action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="w-[20px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[50px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[50px] text-left"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                            <TableCell className="w-[100px] text-right"><div className="flex justify-end"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center"/></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : isError || typeLeaves.length == 0 ? (
                                    <TableRow>
                                        <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={5}>{error?.message ?? "No results"}</TableCell>
                                    </TableRow>
                                ) : (
                                    typeLeaves.map((item: ITypeLeave) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-left">{item?.id}</TableCell>
                                            <TableCell className="font-medium text-left">{item?.name}</TableCell>
                                            <TableCell className="font-medium text-left">{item?.modifiedBy}</TableCell>
                                            <TableCell className="font-medium text-left">{formatDate(item?.modifiedAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <CreateTypeLeaveForm typeLeave={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-type-leave'] })}/>
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
        </div>
    )
}