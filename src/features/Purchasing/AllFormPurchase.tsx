import { Skeleton } from "@/components/ui/skeleton"
import { ChangeEvent, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import itFormApi, { ITForm } from "@/api/itFormApi"
import { Label } from "@/components/ui/label"
import orgUnitApi from "@/api/orgUnitApi"
import { STATUS_ENUM } from "@/lib"
import { YearSelect } from "./StatisticalFormPurchase"

export default function AllFormPurchase () {
    const { t } = useTranslation('formIT');
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

    const { data: itForms = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-it-form', { page, pageSize, selectedDepartment, selectedStatus, selectedYear }],
        queryFn: async () => {
            const res = await itFormApi.getAll({
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
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('list.title_all_form_it')}</h3>
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
                                    <th className="px-4 py-2 border w-[70px] text-left">{t('list.code')}</th>
                                    <th className="px-4 py-2 border w-[320px] text-left">{t('list.reason')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-left">{t('list.user_requestor')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-left">{t('list.department')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-center">{t('list.user_register')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-left">{t('list.created_at')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-left">{t('list.approved_by')}</th>
                                    <th className="px-4 py-2 border w-[100px] text-left">{t('list.status')}</th>
                                </tr>
                            </thead>
                        <tbody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={index}>
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <td key={i} className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-start"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                        ))}
                                    </tr>
                                    ))
                                ) : isError || itForms.length == 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-2 text-center font-bold text-red-700">
                                            {error?.message ?? tCommon('no_results')}
                                        </td>
                                    </tr>
                                ) : (
                                    itForms.map((item: ITForm) => {
                                        const requestStatusId = item?.applicationForm?.requestStatusId

                                        return (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 border text-left">
                                                    <Link to={`/approval/view-form-it/${item?.id ?? '1'}`} className="text-blue-700 underline">{item?.code ?? '--'}</Link>
                                                </td>
                                                <td className="px-4 py-2 border text-left w-[260px] whitespace-normal break-words">
                                                    {item?.reason ?? '--'}
                                                </td>
                                                <td className="px-4 py-2 border text-left">{item?.userNameRequestor ?? '--'}</td>
                                                <td className="px-4 py-2 border text-left">{item?.orgUnit?.name ?? '--'}</td>
                                                <td className="px-4 py-2 border text-left">{item?.userNameCreated ?? '--'}</td>
                                                <td className="px-4 py-2 border text-left">{formatDate(item.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
                                                <td className="px-4 py-2 border text-left">
                                                    {
                                                        item?.applicationForm?.historyApplicationForms.length > 0 ? item?.applicationForm?.historyApplicationForms[0]?.userNameApproval : '--'
                                                    }
                                                </td>
                                                <td className="px-4 py-2 border text-center">
                                                    <StatusLeaveRequest status={
                                                        requestStatusId == STATUS_ENUM.ASSIGNED ? STATUS_ENUM.IN_PROCESS : requestStatusId == STATUS_ENUM.FINAL_APPROVAL ? STATUS_ENUM.PENDING : requestStatusId
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
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                ))}
                                </div>
                            ))
                        ) : isError || itForms.length === 0 ? (
                            <div className="pt-2 pl-4 text-red-700 font-medium dark:text-white">{error?.message ?? t('list_leave_request.no_result')}</div>
                        ) : (
                            itForms.map((item: ITForm) => (
                                <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                    <div className="mb-1"><strong>{t('list.code')}:</strong> {item?.code}</div>
                                    <div className="mb-1"><strong>{t('list.reason')}:</strong> {item?.reason}</div>
                                    <div className="mb-1"><strong>{t('list.user_requestor')}:</strong> {item?.userNameRequestor ?? '--'}</div>
                                    <div className="mb-1"><strong>{t('list.department')}:</strong> {item?.orgUnit?.name}</div>
                                    <div className="mb-1"><strong>{t('list.user_register')}:</strong>{item?.userNameCreated}</div>
                                    <div className="mb-1"><strong>{t('list.created_at')}:</strong> {formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                    <div className="mb-1"><strong>{t('list.approved_by')}:</strong> {item?.reason}</div>
                                    <div className="mb-1"><strong>{t('list.status')}:</strong> <StatusLeaveRequest status={item?.applicationForm?.requestStatusId}/></div>
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