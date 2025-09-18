/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { ChangeEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useAuthStore } from "@/store/authStore"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { STATUS_ENUM } from "@/lib"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import itFormApi, { useDeleteITForm } from "@/api/itFormApi"
import { Label } from "@/components/ui/label"
import { YearSelect } from "./StatisticalFormIT"
import orgUnitApi from "@/api/orgUnitApi"

export default function ListFormIT () {
    const { t } = useTranslation('formIT');
    const { t:tCommon} = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]

    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    
    const {user} = useAuthStore()
    const queryClient = useQueryClient()

    const location = useLocation();
    const isAllForm = location.pathname.includes("all-form-it");

    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const statusIdParam = searchParams.get('statusId');
        const yearParam = searchParams.get('year');

        if (statusIdParam !== null) {
            setSelectedStatus(statusIdParam);
        }

        if (yearParam !== null) {
            setSelectedYear(yearParam)
        }

    }, [searchParams]);
    
    const { data: itForms = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-it-form', { page, pageSize, selectedDepartment, selectedStatus, selectedYear }],
        queryFn: async () => {
            const res = await itFormApi.getAll({
                UserCode: isAllForm ? null : user?.userCode,
                Page: page,
                PageSize: pageSize,
                DepartmentId: selectedDepartment == '' ? null : Number(selectedDepartment),
                RequestStatusId: selectedStatus == '' ? null : Number(selectedStatus),
                Year: selectedYear == '' ? null : Number(selectedYear)
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

    const handleOnChangeDepartment = (e: ChangeEvent<HTMLSelectElement>) => {
        setPage(1)
        setSelectedDepartment(e.target.value)
    }

    const handleOnChangeStatus = (e: ChangeEvent<HTMLSelectElement>) => {
        setPage(1)
        setSelectedStatus(e.target.value)
    }

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-it-form']});
        }
    }

    const delITForm = useDeleteITForm(); 
    const handleDelete = async (id: string) => {
        const shouldGoBack = itForms.length === 1;
        await delITForm.mutateAsync(id);
        handleSuccessDelete(shouldGoBack);
    };

    const { data: departments = [] } = useQuery({
		queryKey: ['get-all-department'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllDepartment()
			return res.data.data
		},
        enabled: isAllForm
	});

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">{isAllForm ? t('list.title_all_form_it') :  t('list.title')}</h3>
                {
                    !isAllForm && (
                        <Button asChild className="w-full md:w-auto">
                            <Link to="/form-it/create">{t('list.btn_create')}</Link>
                        </Button>
                    )
                }
            </div>
            {
                isAllForm && (
                    <div className="flex">
                        <div className="w-[20%]">
                            <Label className="mb-2">{t('list.department')}</Label>
                            <select value={selectedDepartment} onChange={(e) => handleOnChangeDepartment(e)} className="border p-1 rounded w-full cursor-pointer">
                                <option value="">
                                    { lang == 'vi' ? 'Tất cả' : 'All' }
                                </option>
                                {
                                    departments.map((item: { id: number, name: string }, idx: number) => (
                                        <option key={idx} value={item.id}>{item.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="w-[20%] ml-2">
                            <Label className="mb-2">{t('list.status')}</Label>
                            <select value={selectedStatus} onChange={(e) => handleOnChangeStatus(e)} className="border p-1 rounded w-full cursor-pointer">
                                <option value="">{ lang == 'vi' ? 'Tất cả' : 'All' }</option>
                                {
                                    Object.entries(STATUS_ENUM).filter(([, value]) => typeof value === 'number' && [1, 2, 3, 5].includes(value))
                                        .map(([key, value]) => (
                                            <option key={value} value={value}>
                                            {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
                                            </option>
                                        ))
                                }
                            </select>
                        </div>

                        <div className="w-[20%] ml-2">
                            <label className="block mb-0.5 font-semibold text-sm text-gray-700">{t('statistical.time')}</label>
                            <YearSelect onChange={handleYearChange} defaultYear={selectedYear} className="border p-1 rounded w-full cursor-pointer" />
                        </div>
                    </div>
                )
            }

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('list.code')}</th>
                                    <th className="px-4 py-2 border w-[370px] text-center">{t('list.reason')}</th>
                                    <th className="px-4 py-2 border w-[120px] text-center">{t('list.user_requestor')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.department')}</th>
                                    <th className="px-4 py-2 border w-[120px] text-center">{t('list.created_at')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.status')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.action')}</th>
                                </tr>
                            </thead>
                        <tbody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={index}>
                                        {Array.from({ length: 7 }).map((_, i) => (
                                            <td key={i} className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                        ))}
                                    </tr>
                                    ))
                                ) : isError || itForms.length == 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-2 text-center font-bold text-red-700">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    itForms.map((item: any, idx: number) => {
                                        return (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 border text-center">
                                                    <Link to={`/approval/view-form-it/${item?.id ?? '1'}`} className="text-blue-700 underline">{item?.code ?? '--'}</Link>
                                                </td>
                                                <td className="px-4 py-2 border text-left w-[260px] whitespace-normal break-words">
                                                    {item?.reason ?? '--'}
                                                </td>
                                                <td className="px-4 py-2 border text-center">{item?.createdBy ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">{item?.departmentName ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">{formatDate(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
                                                <td className="px-4 py-2 border text-center">
                                                    <StatusLeaveRequest status={
                                                        item?.requestStatusId == STATUS_ENUM.ASSIGNED || item?.requestStatusId == STATUS_ENUM.FINAL_APPROVAL 
                                                            ? STATUS_ENUM.IN_PROCESS 
                                                        : item.requestStatusId
                                                    }/>
                                                </td>
                                                <td className="text-center border font-bold text-red-700">
                                                    {
                                                        item?.requestStatusId == STATUS_ENUM.PENDING ? (
                                                            <>
                                                                <Link to={`/form-it/edit/${item.id}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                                    {t('list.edit')}
                                                                </Link>
                                                                <ButtonDeleteComponent id={item?.id} onDelete={() => handleDelete(item.id)}/>
                                                            </>
                                                        ) : (<>--</>)
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="block md:hidden space-y-4">
                        {isPending ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800">
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                    ))}
                                </div>
                            ))
                        ) : isError || itForms.length === 0 ? (
                            <div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
                        ) : (
                            itForms.map((item: any) => (
                                <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                    <div className="mb-1">
                                        <strong>{t('list.code')}: </strong>
                                        <Link to={`/approval/view-form-it/${item?.id ?? '1'}`} className="text-blue-700 underline font-semibold">{item?.code ?? '--'}</Link>
                                    </div>
                                    <div className="mb-1"><strong>{t('list.reason')}:</strong> {item?.reason}</div>
                                    <div className="mb-1"><strong>{t('list.user_requestor')}: </strong> {item?.createdBy ?? '--'}</div>
                                    <div className="mb-1"><strong>{t('list.department')}: </strong> {item?.departmentName ?? '--'}</div>
                                    <div className="mb-1"><strong>{t('list.created_at')}: </strong> {formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                    <div className="mb-1"><strong>{t('list.status')}: </strong>
                                        <StatusLeaveRequest status={
                                            item?.requestStatusId == STATUS_ENUM.ASSIGNED || item?.requestStatusId == STATUS_ENUM.FINAL_APPROVAL 
                                                ? STATUS_ENUM.IN_PROCESS 
                                            : item.requestStatusId
                                        }/>
                                    </div>
                                    <div className="mb-1">
                                        {
                                            item?.requestStatusId == STATUS_ENUM.PENDING ? (
                                                <>
                                                    <Link to={`/form-it/edit/${item.id}`} className="bg-black text-white px-[10px] py-[2px] rounded-[3px] text-sm">
                                                        {t('list.edit')}
                                                    </Link>
                                                    <ButtonDeleteComponent id={item?.id} onDelete={() => handleDelete(item.id)}/>
                                                </>
                                            ) : (<>--</>)
                                        }
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {
                itForms.length > 0 ? (<PaginationControl
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