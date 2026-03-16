/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Label } from "@/components/ui/label"
import internalMemoHrApi from "@/api/internalMemoHrApi"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import { getErrorMessage, ShowToast, StatusApplicationFormEnum } from "@/lib"

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
        mutationFn: async (id: number) => {
            await internalMemoHrApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (error) => {
            ShowToast(getErrorMessage(error), "error");
        }
    });
    
    const handleDelete = async (applicationFormId: number) => {
        const shouldGoBack = internalMemoHrs.length === 1;
        await mutation.mutateAsync(applicationFormId);
        handleSuccessDelete(shouldGoBack);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {t('internal_memo_hr.title_list')}
                </h3>
                <Button asChild className="w-full md:w-auto bg-black hover:bg-black text-white">
                    <Link to="/internal-memo-hr/create">
                        {t('internal_memo_hr.title_create')}
                    </Link>
                </Button>
            </div>

            <div className="mb-5 pb-3">
                <div className="mb-2">
                    <Label className="mb-2">{t('internal_memo_hr.status')}</Label>
					<select value={status} onChange={(e) => handleOnChangeStatus(e)} className="border p-1 rounded cursor-pointer border-gray-300">
						<option value="">{ lang == 'vi' ? 'Tất cả' : 'All' }</option>
                        <option value="1">{ lang == 'vi' ? 'Đang chờ' : 'Pending' }</option>
                        <option value="2">{ lang == 'vi' ? 'Đang xử lý' : 'In Process' }</option>
                        <option value="3">{ lang == 'vi' ? 'Hoàn thành' : 'Completed' }</option>
                        <option value="5">{ lang == 'vi' ? 'Từ chối' : 'Rejected' }</option>
					</select>
                </div>

                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[500px] hidden md:block">

                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr className="text-black">
                                    <th className="border-gray-300 px-3 py-2 border text-center font-semibold">{t('internal_memo_hr.code')}</th>
                                    <th className="border-gray-300 px-3 py-2 border text-center font-semibold">{t('internal_memo_hr.user_code')}</th>
                                    <th className="border-gray-300 px-3 py-2 border text-center font-semibold">{t('internal_memo_hr.created_by')}</th>
                                    <th className="border-gray-300 px-3 py-2 border text-center font-semibold">{t('internal_memo_hr.department')}</th>
                                    <th className="border-gray-300 px-3 py-2 border text-center font-semibold">{t('internal_memo_hr.title')}</th>
                                    <th className="border-gray-300 px-3 py-2 border text-center font-semibold">{t('internal_memo_hr.created_at')}</th>
                                    <th className="border-gray-300 px-3 py-2 border text-center font-semibold">{t('internal_memo_hr.status')}</th>
                                    <th className="border-gray-300 px-3 py-2 border text-center font-semibold">{t('internal_memo_hr.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <td key={i} className="border-gray-300 px-3 py-2 border text-center">
                                                    <div className="flex justify-center">
                                                        <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : isError || internalMemoHrs.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-4 text-center font-bold text-red-700 border border-gray-300">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    internalMemoHrs.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50 text-black">
                                            <td className="border-gray-300 px-3 py-2 border text-center">
                                                <Link to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`} className="text-blue-600 underline font-medium">
                                                    {item?.applicationForm?.code}
                                                </Link>
                                            </td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">{item?.applicationForm?.userCodeCreatedForm}</td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">{item?.applicationForm?.userNameCreatedForm}</td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">{item?.orgUnit?.name}</td>
                                            <td className="border-gray-300 px-3 py-2 border text-center truncate max-w-[200px]" title={lang == 'vi' ? item?.title : item?.titleE}>
                                                {lang == 'vi' ? item?.title : item?.titleE}
                                            </td>
                                            <td className="border-gray-300 px-3 py-2 border text-center whitespace-nowrap">
                                                {formatDate(item?.createdAt ?? "", 'yyyy-MM-dd HH:mm:ss')}
                                            </td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">
                                                <StatusLeaveRequest status={item?.applicationForm?.requestStatusId}/>
                                            </td>
                                            <td className="border-gray-300 px-3 py-2 border text-center">
                                                <div className="flex justify-center gap-2">
                                                    {item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending ? (
                                                        <>
                                                            <Link to={`/internal-memo-hr/edit/${item?.applicationForm?.code}`} className="bg-black text-white px-3 py-1 rounded-sm text-xs hover:bg-gray-800 transition-colors">
                                                                {lang == 'vi' ? 'Sửa' : 'Edit'}
                                                            </Link>
                                                            <ButtonDeleteComponent id={item?.applicationForm?.id} onDelete={() => handleDelete(item?.applicationForm?.id)} />
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">--</span>
                                                    )}
                                                </div>
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
                                <div
                                    key={index}
                                    className="border rounded p-4 space-y-2 shadow bg-white "
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
                            <div className="p-2 text-red-700 border text-center font-medium  mt-5">
                                {error?.message ?? tCommon("no_results")}
                            </div>
                        ) : (
                            internalMemoHrs.map((item: any, idx: number) => {
                                return (
                                    <div
                                        key={idx}
                                        className="border rounded p-4 shadow bg-white  mt-5"
                                        >
                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.code")}: </strong>
                                            <Link to={`/view/${item?.applicationForm?.code}?requestType=${item?.applicationForm?.requestTypeId}`} className="text-blue-600 underline">{item?.applicationForm?.code}</Link>
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.user_code")}: </strong>
                                            {item?.applicationForm?.userCodeCreatedForm}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.created_by")}: </strong>
                                            {item?.applicationForm?.userNameCreatedForm}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.department")}: </strong>
                                            {item?.orgUnit?.name}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.title")}: </strong>
                                            {lang == 'vi' ? item?.title : item?.titleE}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.created_at")}: </strong>
                                            {formatDate(item?.createdAt ?? "", "yyyy-MM-dd HH:mm:ss")}
                                        </div>

                                        <div className="mb-1">
                                            <strong>{t("internal_memo_hr.status")}: </strong>
                                            <StatusLeaveRequest status={item?.applicationForm?.requestStatusId}/>
                                        </div>

                                        <div className="mt-2">
                                            {item?.applicationForm?.requestStatusId == StatusApplicationFormEnum.Pending ? (
                                                <>
                                                    <Link
                                                        to={`/internal-memo-hr/edit/${item?.applicationForm?.code}`}
                                                        className="bg-black text-white px-[10px] py-[5px] rounded-[3px] text-sm mr-1"
                                                    >
                                                        {lang == "vi" ? "Sửa" : "Edit"}
                                                    </Link>
                                                    <ButtonDeleteComponent
                                                        id={item?.applicationForm?.id}
                                                        onDelete={() => handleDelete(item?.applicationForm?.id)}
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