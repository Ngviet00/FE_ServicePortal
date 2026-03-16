/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import { getErrorMessage, ShowToast, StatusApplicationFormEnum } from "@/lib"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { IRequestStatus } from "@/api/itFormApi"
import { IRequestType } from "@/api/requestTypeApi"
import overTimeApi from "@/api/overTimeApi"
import { Button } from "@/components/ui/button"

interface GetMyLeaveRequestRegistered {
    id?: string,
    code?: string,
    userNameCreatedForm?: string,
    createdAt?: string,
    requestStatus?: IRequestStatus,
    requestType?: IRequestType
}

export default function ListOverTimeRegister () {
    const { t } = useTranslation('hr')
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    
    const { data: overTimeRegisters = [], isPending, isError, error } = useQuery({
        queryKey: ['get-overtime-registered', { page, pageSize }],
        queryFn: async () => {
            const res = await overTimeApi.getOverTimeRegister({
                UserCode: user?.userCode ?? "",
                Page: page,
                PageSize: pageSize
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        },
    });

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-overtime-registered'] });
        }
    }

    const mutation = useMutation({
        mutationFn: async (id: string) => {
            await overTimeApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (error) => {
            ShowToast(getErrorMessage(error), "error");
        }
    });

    const handleDelete = async (code: string) => {
        const shouldGoBack = overTimeRegisters.length === 1;
        await mutation.mutateAsync(code);
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {t('overtime.list_register.title')}
                </h3>
                <Button asChild className="w-full md:w-auto bg-black hover:bg-black text-white">
                    <Link to="/overtime/create">
                        {t('overtime.create.title_create')}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr className="text-black">
                                    <th className="border-gray-300 w-[100px] px-4 py-2 border text-center font-semibold">{t('overtime.list_register.code')}</th>
                                    <th className="border-gray-300 w-[120px] px-4 py-2 border text-center font-semibold">{t('overtime.list_register.RequestTypeEnum')}</th>
                                    <th className="border-gray-300 w-[120px] px-4 py-2 border text-center font-semibold">{t('overtime.list_register.created_by')}</th>
                                    <th className="border-gray-300 w-[150px] px-4 py-2 border text-center font-semibold">{t('overtime.list_register.created_at')}</th>
                                    <th className="border-gray-300 w-[130px] px-4 py-2 border text-center font-semibold">{t('overtime.list_register.status')}</th>
                                    <th className="border-gray-300 w-[150px] px-4 py-2 border text-center font-semibold">{t('overtime.list_register.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <td key={i} className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                    <div className="flex justify-center">
                                                        <Skeleton className="h-4 w-[80px] bg-gray-300" />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError || overTimeRegisters.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-4 text-center font-bold text-red-700 border border-gray-300">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    overTimeRegisters.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50 text-black">
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center font-medium">
                                                <Link to={`/view/${item?.code}?requestType=${item?.requestType?.id}`} className="text-blue-600 underline">
                                                    {item?.code}
                                                </Link>
                                            </td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                {lang == 'vi' ? item?.requestType?.name : item?.requestType?.nameE}
                                            </td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                {item?.userNameCreatedForm}
                                            </td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                {formatDate(item.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}
                                            </td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                <StatusLeaveRequest 
                                                    status={item.requestStatus?.id == StatusApplicationFormEnum.Pending 
                                                        ? 'Pending' 
                                                        : item?.requestStatus?.id == StatusApplicationFormEnum.Complete ? 'Completed' 
                                                        : item?.requestStatus?.id == StatusApplicationFormEnum.Reject ? 'Reject' : 'In Process'}
                                                />
                                            </td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                {item?.requestStatus?.id == StatusApplicationFormEnum.Pending ? (
                                                    <div className="flex justify-center space-x-2">
                                                        <Link to={`/overtime/edit/${item?.code}`} className="bg-black text-white px-[10px] py-[4px] rounded-[3px] text-xs">
                                                            {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                        </Link>
                                                        <ButtonDeleteComponent id={item?.code} onDelete={() => handleDelete(item?.code ?? "")} />
                                                    </div>
                                                ) : (
                                                    <span>--</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="border rounded p-4 space-y-2 shadow bg-white ">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                    </div>
                                ))
                            ) : isError || overTimeRegisters.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium  mt-5">{ error?.message ?? tCommon('no_results') } </div>
                            ) : (
                                overTimeRegisters.map((item: GetMyLeaveRequestRegistered) => {
                                    return (
                                        <div key={item.id} className="border rounded p-4 shadow bg-white  mt-5">
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Mã đơn' : 'Code'}: </strong>
                                                <Link to={`/view/${item?.code}?requestType=${item?.requestType?.id}`} className="text-blue-600 underline">
                                                     {item?.code}
                                                </Link>
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Loại đơn' : 'Request type'}: </strong> { lang == 'vi' ? item?.requestType?.name : item?.requestType?.nameE }
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Người tạo' : 'Created By'}: </strong> { lang == 'vi' ? item?.userNameCreatedForm : item?.userNameCreatedForm }
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Thời gian tạo' : 'Created At'}: </strong> { formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Trạng thái' : 'Status'}: </strong> { lang == 'vi' ? item?.requestStatus?.name : item?.requestStatus?.nameE }
                                            </div>
                                            <div className="mb-1">
                                                <strong>{lang == 'vi' ? 'Hành động' : 'Action'}: </strong> 
                                                {
                                                    item?.requestStatus?.id == StatusApplicationFormEnum.Pending ? (
                                                        <>
                                                            <Link to={`/overtime/edit/${item?.code}`} className="bg-black text-white px-[10px] py-[5px] rounded-[3px] text-sm">
                                                                {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                            </Link>
                                                            <ButtonDeleteComponent id={item?.code} onDelete={() => handleDelete(item?.code ?? "")} />
                                                        </>
                                                    ) : (
                                                        <span>--</span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            )
                        )}
                    </div>
                </div>
            </div>
            {
                overTimeRegisters.length > 0 ? (<PaginationControl
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