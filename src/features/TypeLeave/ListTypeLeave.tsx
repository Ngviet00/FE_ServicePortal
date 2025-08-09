import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage, ShowToast, useDebounce } from "@/lib"
import { useTranslation } from "react-i18next"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import CreateTypeLeaveForm from "./CreateTypeLeaveForm"
import typeLeaveApi, { ITypeLeave } from "@/api/typeLeaveApi"


export default function ListTypeLeave () {
    const { t } = useTranslation();
    const { t: tCommon } = useTranslation('common')
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
            <div className="mt-5">
				<div className="overflow-x-auto">
         			<table className="min-w-full text-sm border border-gray-200">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2 border w-[70px]">STT</th>
								<th className="px-4 py-2 border w-[400px]">{t('type_leave_page.name')}</th>
                                <th className="px-4 py-2 border w-[400px]">{t('type_leave_page.nameV')}</th>
                                <th className="px-4 py-2 border w-[400px]">{t('type_leave_page.code')}</th>
								<th className="px-4 py-2 border w-[300px]">{t('type_leave_page.action')}</th>
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
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[80px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[90px] bg-gray-300" /></div></td>
                                        </tr>  
                                    ))
                                ) : isError || typeLeaves.length == 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-2 text-center font-bold text-red-700">
                                            { error?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    typeLeaves?.map((item: ITypeLeave, idx: number) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.nameV}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item.code}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                <CreateTypeLeaveForm typeLeave={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-type-leave'] })}/>
                                                <ButtonDeleteComponent id={item.id} onDelete={() => handleDelete(item.id)}/>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
						</tbody>
        			</table>
     		 	</div>
			</div>
        </div>
    )
}