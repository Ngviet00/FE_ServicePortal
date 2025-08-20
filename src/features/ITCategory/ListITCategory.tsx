import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import CreateITCategoryForm from "./CreateITCategoryForm"
import itCategoryApi, { ITCategoryInterface, useDeleteITCategory } from "@/api/itCategoryApi"

export default function ListITCategory () {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common')
    const queryClient = useQueryClient();
    
    const { data: itCategories = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-it-category'],
        queryFn: async () => {
            const res = await itCategoryApi.getAll();
            return res.data.data;
        },
    });

    const useDltITCategory = useDeleteITCategory()
    const handleDelete = async (id: number | undefined) => {
        await useDltITCategory.mutateAsync(id)
        queryClient.invalidateQueries({ queryKey: ['get-all-it-category'] })
    };

    return (
        <div className="p-4 pl-1 pt-0 list-role">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('it_category_page.title')}</h3>
                <CreateITCategoryForm onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-it-category'] })}/>
            </div>

            <div className="mt-5">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border w-[70px]">ID</th>
                                <th className="px-4 py-2 border w-[400px]">{t('it_category_page.name')}</th>
                                <th className="px-4 py-2 border w-[300px]">{t('it_category_page.code')}</th>
                                <th className="px-4 py-2 border">{t('it_category_page.action')}</th>
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
                                ) : isError || itCategories.length == 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-2 text-center font-bold text-red-700">
                                            { error?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    itCategories?.map((item: ITCategoryInterface) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                {item.id}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item?.code}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                <CreateITCategoryForm itCategory={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-it-category'] })}/>
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