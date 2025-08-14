import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage, ShowToast } from "@/lib"
import { useTranslation } from "react-i18next"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import CreateRequestTypeForm from "./CreateRequestTypeForm"
import requestTypeApi, { IRequestType } from "@/api/requestTypeApi"

export default function ListRequestType () {
    const { t } = useTranslation('requestType')
    const { t: tCommon } = useTranslation('common')
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const queryClient = useQueryClient();
    
    const { data: permissions = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-request-type', page, pageSize],
        queryFn: async () => {
            const res = await requestTypeApi.getAll({
                page: page,
                pageSize: pageSize,
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-request-type'] });
        }
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
            await requestTypeApi.delete(id);
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
            const shouldGoBack = permissions.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
    };

    return (
        <div className="p-4 pl-1 pt-0 list-role">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('title')}</h3>
                <CreateRequestTypeForm onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-request-type'] })}/>
            </div>

            <div className="mt-5">
				<div className="overflow-x-auto">
         			<table className="min-w-full text-sm border border-gray-200">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2 border w-[70px]">STT</th>
								<th className="px-4 py-2 border w-[400px]">{t('name')}</th>
								<th className="px-4 py-2 border w-[300px]">{t('nameE')}</th>
								<th className="px-4 py-2 border">{t('action')}</th>
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
                                ) : isError || permissions.length == 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-2 text-center font-bold text-red-700">
                                            { error?.message ?? tCommon('no_results') } 
                                        </td>
                                    </tr>
                                ) : (
                                    permissions?.map((item: IRequestType, idx: number) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                {(page - 1) * pageSize + idx + 1}
                                            </td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item.name}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap">{item.nameE ?? "--"}</td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center">
                                                <CreateRequestTypeForm requestType={item} onAction={() => queryClient.invalidateQueries({ queryKey: ['get-all-request-type'] })}/>
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
                permissions.length > 0 ? (<PaginationControl
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