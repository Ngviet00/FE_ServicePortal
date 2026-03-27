/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import { StatusApplicationFormEnum } from "@/lib"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import terminationLetterApi, { useDeleteTerminationLetter } from "@/api/HR/terminationLetterApi"
import { Button } from "@/components/ui/button"

export default function ListTermination () {
    const { t } = useTranslation('hr')
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    const { data: listTerminationLetters = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-termination-letter', { page, pageSize }],
        queryFn: async () => {
            const res = await terminationLetterApi.getAll({
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
            queryClient.invalidateQueries({ queryKey: ['get-list-termination-letter'] });
        }
    }

    const deleteTermination = useDeleteTerminationLetter()
    const handleDelete = async (id: number) => {
        const shouldGoBack = listTerminationLetters.length === 1;
        await deleteTermination.mutateAsync(id)
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {t('termination.list.title')}
                </h3>
                <div>
                    <Button 
                        onClick={() => navigate("/termination/create")} 
                        className="w-full md:w-auto hover:cursor-pointer bg-black text-white hover:bg-black"
                    >
                        {t('termination.create.title')}
                    </Button>
                </div>
            </div>

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr className="text-black">
                                    <th className="border-gray-300 w-[100px] px-4 py-2 border text-center">{t('termination.list.code')}</th>
                                    <th className="border-gray-300 w-[100px] px-4 py-2 border text-center">{t('termination.create.usercode')}</th>
                                    <th className="border-gray-300 w-[150px] px-4 py-2 border text-center">{t('termination.create.username')}</th>
                                    <th className="border-gray-300 w-[130px] px-4 py-2 border text-center">{t('termination.create.department')}</th>
                                    <th className="border-gray-300 w-[150px] px-4 py-2 border text-center">{t('termination.create.position')}</th>
                                    <th className="border-gray-300 w-[150px] px-4 py-2 border text-center">{t('termination.create.unit')}</th>
                                    <th className="border-gray-300 w-[150px] px-4 py-2 border text-center">{t('termination.list.created_at')}</th>
                                    <th className="border-gray-300 w-[120px] px-4 py-2 border text-center">{t('termination.list.status')}</th>
                                    <th className="border-gray-300 w-[150px] px-4 py-2 border text-center">{t('termination.list.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            {Array.from({ length: 9 }).map((_, i) => (
                                                <td key={i} className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                    <div className="flex justify-center">
                                                        <Skeleton className="h-4 w-[80px] bg-gray-300" />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError || listTerminationLetters.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-4 text-center font-bold text-red-700 border border-gray-300">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    listTerminationLetters.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50 text-black">
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center font-medium">
                                                <Link to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`} className="text-blue-600 underline">
                                                    {item?.applicationForm?.code}
                                                </Link>
                                            </td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">{item?.userCode}</td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">{item?.userName}</td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">{item?.departmentName}</td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">{item?.position}</td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">{item?.unit}</td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                {formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}
                                            </td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                <StatusLeaveRequest 
                                                    status={item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending 
                                                        ? 'Pending' : item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Complete 
                                                        ? 'Completed' : item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Reject 
                                                        ? 'Reject' : 'In Process'}
                                                />
                                            </td>
                                            <td className="border-gray-300 px-4 py-2 border whitespace-nowrap text-center">
                                                {item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending ? (
                                                    <div className="flex justify-center space-x-2">
                                                        <Link to={`/termination/edit/${item?.applicationForm?.code}`} className="bg-black text-white px-[10px] py-[4px] rounded-[3px] text-xs">
                                                            {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                        </Link>
                                                        <ButtonDeleteComponent id={item?.id} onDelete={() => handleDelete(item?.id ?? "")} />
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
                            ) : isError || listTerminationLetters.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium  mt-5">{ error?.message ?? tCommon('no_results') } </div>
                            ) : (
                                listTerminationLetters.map((item: any) => {
                                    return (
                                        <div key={item.id} className="border rounded p-4 shadow bg-white  space-y-1">
                                            <div>
                                                <strong>{t('termination.list.code')}: </strong>
                                                <Link
                                                    to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`}
                                                    className="text-blue-600 underline"
                                                >
                                                    {item?.applicationForm?.code}
                                                </Link>
                                            </div>
                                            <div>
                                                <strong>{t('termination.create.usercode')}: </strong>
                                                {item?.userCode}
                                            </div>
                                            <div>
                                                <strong>{t('termination.create.username')}: </strong>
                                                {item?.userName}
                                            </div>
                                            <div>
                                                <strong>{t('termination.create.department')}: </strong>
                                                {item?.departmentName}
                                            </div>
                                            <div>
                                                <strong>{t('termination.create.position')}: </strong>
                                                {item?.position}
                                            </div>
                                            <div>
                                                <strong>{t('termination.create.unit')}: </strong>
                                                {item?.unit}
                                            </div>
                                            <div>
                                                <strong>{t('termination.list.created_at')}: </strong>
                                                {formatDate(item?.createdAt ?? '', 'yyyy/MM/dd HH:mm:ss')}
                                            </div>
                                            <div>
                                                <strong>{t('termination.list.status')}: </strong>
                                                <StatusLeaveRequest
                                                    status={
                                                    item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending
                                                        ? 'Pending'
                                                        : item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Complete
                                                        ? 'Completed'
                                                        : item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Reject
                                                        ? 'Reject'
                                                        : 'In Process'
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <strong>{t('termination.list.action')}: </strong>
                                                {item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending ? (
                                                    <div className="flex space-x-2 mt-1">
                                                        <Link
                                                            to={`/termination/edit/${item?.applicationForm?.code}`}
                                                            className="bg-black text-white px-2 py-1 rounded text-sm"
                                                        >
                                                            {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                        </Link>
                                                        <ButtonDeleteComponent
                                                            id={item?.id}
                                                            onDelete={() => handleDelete(item?.id ?? '')}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span>--</span>
                                                )}
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
                listTerminationLetters.length > 0 ? (<PaginationControl
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