/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { ChangeEvent, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { Label } from "@/components/ui/label"
import orgUnitApi from "@/api/orgUnitApi"
import { STATUS_ENUM } from "@/lib"
import { YearSelect } from "./StatisticalFormPurchase"
import purchaseApi, { IPurchase } from "@/api/purchaseApi"

export default function AllFormPurchase () {
    const { t } = useTranslation('purchase');
    const { t:tCommon} = useTranslation('common');
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
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

    const lang = useTranslation().i18n.language.split('-')[0]

    const { data: purchases = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-purchase', { page, pageSize, selectedDepartment, selectedStatus, selectedYear }],
        queryFn: async () => {
            const res = await purchaseApi.getAll({
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
    
	const { data: departments = [] } = useQuery({
		queryKey: ['get-all-department'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllDepartment()
			return res.data.data
		},
	});

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('list.title')}</h3>
            </div>

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

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border w-[70px] text-center">{t('list.code')}</th>
                                    <th className="px-4 py-2 border w-[120px] text-center">{t('list.user_requestor')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.department')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.created_at')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.status')}</th>
                                </tr>
                            </thead>
                        <tbody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={index}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <td key={i} className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                        ))}
                                    </tr>
                                    ))
                                ) : isError || purchases.length == 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-2 text-center font-bold text-red-700">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    purchases.map((item: any) => {
                                        const rsApplicationForm = item?.applicationFormItem?.applicationForm;

                                        return (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 border text-center">
                                                    <Link to={`/approval/view-purchase/${item?.id ?? '1'}`} className="text-blue-700 underline">{rsApplicationForm?.code ?? '--'}</Link>
                                                </td>
                                                <td className="px-4 py-2 border text-center">{rsApplicationForm?.createdBy ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">{item?.orgUnit?.name ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">{formatDate(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
                                                <td className="px-4 py-2 border text-center">
                                                    <StatusLeaveRequest status={
                                                        rsApplicationForm.requestStatusId == STATUS_ENUM.ASSIGNED || rsApplicationForm.requestStatusId == STATUS_ENUM.FINAL_APPROVAL 
                                                            ? STATUS_ENUM.IN_PROCESS 
                                                        : rsApplicationForm.requestStatusId
                                                    }/>
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
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                ))}
                                </div>
                            ))
                        ) : isError || purchases.length === 0 ? (
                            <div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
                        ) : (
                            purchases.map((item: IPurchase) => (
                                <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                    <div className="mb-1"><strong>{t('list.code')}:</strong> {item?.applicationForm?.code}</div>
                                    <div className="mb-1"><strong>{t('list.user_requestor')}:</strong> {item?.applicationForm?.userNameRequestor ?? '--'}</div>
                                    <div className="mb-1"><strong>{t('list.department')}:</strong> {item?.orgUnit?.name}</div>
                                    <div className="mb-1"><strong>{t('list.created_at')}:</strong> {formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                    <div className="mb-1"><strong>{t('list.status')}:</strong> <StatusLeaveRequest status={item?.applicationForm?.requestStatusId}/></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {
                purchases.length > 0 ? (<PaginationControl
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