/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import { StatusApplicationFormEnum } from "@/lib"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Button } from "@/components/ui/button"
import warningLetterApi, { useDeleteWarningLetter } from "@/api/HR/warningLetterApi"

export default function ListWarningLetter () {
    const { t } = useTranslation('hr')
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type") ?? ''; // "Registered"
    const TYPE_REGISTERED = 'Registered'
    
    const { data: listWarningLetters = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-warning-letter', { page, pageSize, type }],
        queryFn: async () => {
            const res = await warningLetterApi.getAll({
                UserCode: user?.userCode ?? "",
                Page: page,
                PageSize: pageSize,
                Type: type ?? ''
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
            queryClient.invalidateQueries({ queryKey: ['get-list-warning-letter'] });
        }
    }

    const deleteWarning = useDeleteWarningLetter()
    const handleDelete = async (id: number) => {
        const shouldGoBack = listWarningLetters.length === 1;
        await deleteWarning.mutateAsync(id)
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {type == 'Registered' ? t('warning_letter.list.title') : t('warning_letter.list.my_warning_letter') }
                </h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/warningletter/create">
                        {lang == 'vi' ? 'Tạo đơn kỷ luật' : 'Create warning letter'}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f3f4f6] border">
                                    <TableHead className="w-[100px] text-center border">{t('warning_letter.list.code')}</TableHead>
                                    <TableHead className="w-[100px] text-center border">{t('warning_letter.create.usercode')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('warning_letter.create.username')}</TableHead>
                                    <TableHead className="w-[130px] text-center border">{t('warning_letter.create.department')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('warning_letter.create.position')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('warning_letter.create.unit')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('warning_letter.create.reason')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('warning_letter.list.created_at')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('warning_letter.list.status')}</TableHead>
                                    {type == TYPE_REGISTERED && <TableHead className="w-[150px] text-center border">{t('warning_letter.list.action')}</TableHead>}
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: type == TYPE_REGISTERED ? 10 : 9 }).map((_, i) => (
                                            <TableCell key={i} className="border">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                </div>
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                ) : isError || listWarningLetters.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={type == TYPE_REGISTERED ? 10 : 9} className="text-red-700 border text-center font-medium dark:text-white">
                                            { error?.message ?? tCommon('no_results') } 
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listWarningLetters.map((item: any) => {
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-center border">
                                                    <Link to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`} className="text-blue-600 underline">
                                                        {item?.applicationForm?.code}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-center border">{item?.userCode}</TableCell>
                                                <TableCell className="text-center border">{item?.userName}</TableCell>
                                                <TableCell className="text-center border">{item?.departmentName}</TableCell>
                                                <TableCell className="text-center border">{item?.position}</TableCell>
                                                <TableCell className="text-center border">{item?.unit}</TableCell>
                                                <TableCell className="text-center border whitespace-normal min-w-sm max-w-4xl">{item?.reason}</TableCell>
                                                <TableCell className="text-center border">{formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</TableCell>
                                                <TableCell className="text-center border">
                                                    <StatusLeaveRequest 
                                                        status={item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending 
                                                            ? 'Pending' : item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Complete 
                                                            ? 'Completed' : item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Reject 
                                                            ? 'Reject' : 'In Process'}
                                                    />
                                                </TableCell>
                                                {
                                                    type == TYPE_REGISTERED && 
                                                        <TableCell className="text-center border">
                                                        {
                                                            item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending ? (
                                                                <>
                                                                    <Link to={`/warningletter/edit/${item?.applicationForm?.code}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                                        {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                                    </Link>
                                                                    <ButtonDeleteComponent id={item?.id} onDelete={() => handleDelete(item?.id ?? "")} />
                                                                </>
                                                            ) : (
                                                                <span>--</span>
                                                            )
                                                        }
                                                    </TableCell>
                                                }
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                        ))}
                                    </div>
                                ))
                            ) : isError || listWarningLetters.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium dark:text-white mt-5">{ error?.message ?? tCommon('no_results') } </div>
                            ) : (
                                listWarningLetters.map((item: any) => {
                                    return (
                                        <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 space-y-1">
                                            <div>
                                                <strong>{t('warning_letter.list.code')}: </strong>
                                                <Link
                                                    to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`}
                                                    className="text-blue-600 underline"
                                                >
                                                    {item?.applicationForm?.code}
                                                </Link>
                                            </div>
                                            <div>
                                                <strong>{t('warning_letter.create.usercode')}: </strong>
                                                {item?.userCode}
                                            </div>
                                            <div>
                                                <strong>{t('warning_letter.create.username')}: </strong>
                                                {item?.userName}
                                            </div>
                                            <div>
                                                <strong>{t('warning_letter.create.department')}: </strong>
                                                {item?.departmentName}
                                            </div>
                                            <div>
                                                <strong>{t('warning_letter.create.position')}: </strong>
                                                {item?.position}
                                            </div>
                                            <div>
                                                <strong>{t('warning_letter.create.unit')}: </strong>
                                                {item?.unit}
                                            </div>
                                            <div>
                                                <strong>{t('warning_letter.create.reason')}: </strong>
                                                {item?.reason}
                                            </div>
                                            <div>
                                                <strong>{t('warning_letter.list.created_at')}: </strong>
                                                {formatDate(item?.createdAt ?? '', 'yyyy/MM/dd HH:mm:ss')}
                                            </div>
                                            <div>
                                                <strong>{t('warning_letter.list.status')}: </strong>
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
                                            {type == TYPE_REGISTERED && (
                                                <div>
                                                    <strong>{t('warning_letter.list.action')}: </strong>
                                                    {item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending ? (
                                                        <div className="flex space-x-2 mt-1">
                                                            <Link
                                                                to={`/warningletter/edit/${item?.applicationForm?.code}`}
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
                                            )}
                                        </div>
                                    )
                                }
                            )
                        )}
                    </div>
                </div>
            </div>
            {
                listWarningLetters.length > 0 ? (<PaginationControl
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