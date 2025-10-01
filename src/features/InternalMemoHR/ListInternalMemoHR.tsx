/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Label } from "@/components/ui/label"
import internalMemoHrApi from "@/api/internalMemoHrApi"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { getErrorMessage, ShowToast, STATUS_ENUM } from "@/lib"

export default function ListInternalMemoHR () {
    const { t } = useTranslation('hr')
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0];
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [status, setStatus] = useState('')
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    
    const { data: internalMemoHrs = [], isPending, isError, error } = useQuery({
        queryKey: ['get-internal-memo-hr', { page, pageSize, status: status }],
        queryFn: async () => {
            const res = await internalMemoHrApi.list({
                UserCode: user?.userCode ?? "",
                Page: page,
                PageSize: pageSize,
                Status: status == '' ? null : parseInt(status)
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

    const handleOnChangeStatus = (e: ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    }

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-internal-memo-hr'] });
        }
    }

    const mutation = useMutation({
        mutationFn: async (id: string) => {
            await internalMemoHrApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (error) => {
            ShowToast(getErrorMessage(error), "error");
        }
    });
    
    const handleDelete = async (code: string) => {
        const shouldGoBack = internalMemoHrs.length === 1;
        await mutation.mutateAsync(code);
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {t('internal_memo_hr.title_list')}
                </h3>
                <Button asChild className="w-full md:w-auto">
                    <Link to="/internal-memo-hr/create">
                        {t('internal_memo_hr.title_create')}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mb-2">
                    <Label className="mb-2">{t('internal_memo_hr.status')}</Label>
					<select value={status} onChange={(e) => handleOnChangeStatus(e)} className="border p-1 rounded cursor-pointer">
						<option value="">{ lang == 'vi' ? 'Tất cả' : 'All' }</option>
                        <option value="1">{ lang == 'vi' ? 'Đang chờ' : 'Pending' }</option>
                        <option value="2">{ lang == 'vi' ? 'Đang xử lý' : 'In Process' }</option>
                        <option value="3">{ lang == 'vi' ? 'Hoàn thành' : 'Completed' }</option>
                        <option value="5">{ lang == 'vi' ? 'Từ chối' : 'Rejected' }</option>
					</select>
                </div>

                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f3f4f6] border">
                                    <TableHead className="text-center border">{t('internal_memo_hr.code')}</TableHead>
                                    <TableHead className="text-center border">{t('internal_memo_hr.user_code')}</TableHead>
                                    <TableHead className="text-center border">{t('internal_memo_hr.created_by')}</TableHead>
                                    <TableHead className="text-center border">{t('internal_memo_hr.department')}</TableHead>
                                    <TableHead className="text-center border">{t('internal_memo_hr.title')}</TableHead>
                                    <TableHead className="text-center border">{t('internal_memo_hr.created_at')}</TableHead>
                                    <TableHead className="text-center border">{t('internal_memo_hr.status')}</TableHead>
                                    <TableHead className="text-center border">{t('internal_memo_hr.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 1 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <TableCell key={i}>
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                </div>
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                ) : isError || internalMemoHrs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-red-700 border text-center font-medium dark:text-white">
                                            { error?.message ?? tCommon('no_results') } 
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    internalMemoHrs.map((item: any, idx: number) => {
                                        const meta = JSON.parse(item?.metaData);
                                        const title = meta?.Title == 'other' ? meta?.TitleOther : t(`internal_memo_hr.${meta.Title}`)
                                        
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell className="text-center border">
                                                    <Link to={`/internal-memo-hr/${item.code}?mode=view`} className="text-blue-600 underline">{item?.code}</Link>
                                                </TableCell>
                                                <TableCell className="text-center border">{item?.userCodeCreatedForm}</TableCell>
                                                <TableCell className="text-center border">{item?.userNameCreatedForm}</TableCell>
                                                <TableCell className="text-center border">{item?.orgUnit?.name}</TableCell>
                                                <TableCell className="text-center border">{title}</TableCell>
                                                <TableCell className="text-center border">{formatDate(item?.createdAt ?? "", 'yyyy-MM-dd HH:mm:ss') }</TableCell>
                                                <TableCell className="text-center border">
                                                    <StatusLeaveRequest 
                                                        status={item.requestStatusId == STATUS_ENUM.PENDING ? 'Pending' 
                                                            : item.requestStatusId == STATUS_ENUM.COMPLETED ? 'Completed' 
                                                            : item.requestStatusId == STATUS_ENUM.REJECT ? 'Reject' : 'In Process'}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center border">
                                                    {
                                                            item?.requestStatus?.id == STATUS_ENUM.PENDING ? (
                                                                <>
                                                                    <Link to={`/internal-memo-hr/edit/${item?.code}`} className="bg-black text-white px-[10px] py-[2.5px] rounded-[3px] text-sm">
                                                                        {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                                    </Link>
                                                                    <ButtonDeleteComponent id={item?.code} onDelete={() => handleDelete(item?.code ?? "")} />
                                                                </>
                                                            ) : (
                                                                <span>--</span>
                                                            )
                                                        }
                                                </TableCell>
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
                                <div
                                    key={index}
                                    className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800"
                                >
                                    {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-4 w-full bg-gray-300 rounded animate-pulse"
                                    />
                                    ))}
                                </div>
                            ))
                        ) : isError || internalMemoHrs.length === 0 ? (
                            <div className="p-2 text-red-700 border text-center font-medium dark:text-white mt-5">
                                {error?.message ?? tCommon("no_results")}
                            </div>
                        ) : (
                            internalMemoHrs.map((item: any, idx: number) => {
                                const meta = JSON.parse(item?.metaData);
                                const title =
                                    meta?.Title == "other"
                                    ? meta?.TitleOther
                                    : t(`internal_memo_hr.${meta.Title}`);

                                return (
                                    <div
                                        key={idx}
                                        className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5"
                                        >
                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.code")}: </strong>
                                            <Link
                                            to={`/internal-memo-hr/${item.code}?mode=view`}
                                            className="text-blue-600 underline"
                                            >
                                            {item?.code}
                                            </Link>
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.user_code")}: </strong>
                                            {item?.userCodeCreatedForm}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.created_by")}: </strong>
                                            {item?.userNameCreatedForm}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.department")}: </strong>
                                            {item?.orgUnit?.name}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.title")}: </strong>
                                            {title}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.created_at")}: </strong>
                                            {formatDate(item?.createdAt ?? "", "yyyy-MM-dd HH:mm:ss")}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.status")}: </strong>
                                            <StatusLeaveRequest
                                            status={
                                                item.requestStatusId == STATUS_ENUM.PENDING
                                                ? "Pending"
                                                : item.requestStatusId == STATUS_ENUM.COMPLETED
                                                ? "Completed"
                                                : item.requestStatusId == STATUS_ENUM.REJECT
                                                ? "Reject"
                                                : "In Process"
                                            }
                                            />
                                        </div>

                                        <div className="mt-2">
                                            {item?.requestStatus?.id == STATUS_ENUM.PENDING ? (
                                                <>
                                                    <Link
                                                        to={`/internal-memo-hr/edit/${item?.code}`}
                                                        className="bg-black text-white px-[10px] py-[2.5px] rounded-[3px] text-sm mr-2"
                                                    >
                                                        {lang == "vi" ? "Sửa" : "Edit"}
                                                    </Link>
                                                    <ButtonDeleteComponent
                                                        id={item?.code}
                                                        onDelete={() => handleDelete(item?.code ?? "")}
                                                    />
                                                </>
                                                ) : (
                                                    <span>--</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                </div>
            </div>
            {
                internalMemoHrs.length > 0 ? (<PaginationControl
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