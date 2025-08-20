import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import CreatePriorityForm from "./CreatePriorityForm"
import priorityApi, { IPriority, useDeletePriority } from "@/api/priorityApi"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"

export default function ListPriority () {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common')
    const queryClient = useQueryClient();
    
    const { data: priorities = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-priority'],
        queryFn: async () => {
            const res = await priorityApi.getAll();
            return res.data.data;
        },
    });

    const useDltPriority = useDeletePriority()
    const handleDelete = async (id: number | undefined) => {
        await useDltPriority.mutateAsync(id)
        queryClient.invalidateQueries({ queryKey: ['get-all-priority'] })
    };

    return (
        <div className="p-4 pl-1 pt-0 list-role">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('priority_page.title')}</h3>
                <CreatePriorityForm onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-priority'] })}/>
            </div>

            <div className="mt-5">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border w-[70px]">ID</th>
                                <th className="px-4 py-2 border w-[400px]">{t('priority_page.name')}</th>
                                <th className="px-4 py-2 border w-[300px]">{t('priority_page.nameE')}</th>
                                <th className="px-4 py-2 border">{t('priority_page.action')}</th>
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
                                ) : isError || priorities.length == 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-2 text-center font-bold text-red-700">
                                            { error?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    priorities?.map((item: IPriority) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                {item.id}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.nameE}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                <CreatePriorityForm priority={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-priority'] })}/>
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
        </div>
    )
}