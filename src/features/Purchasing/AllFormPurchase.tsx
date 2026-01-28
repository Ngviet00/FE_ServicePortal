/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { ChangeEvent, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { StatusLeaveRequest } from "@/components/StatusLeaveRequest/StatusLeaveRequestComponent"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { Label } from "@/components/ui/label"
import orgUnitApi from "@/api/orgUnitApi"
import { YearSelect } from "./StatisticalFormPurchase"
import purchaseApi from "@/api/purchaseApi"

export default function AllFormPurchase () {
    const { t } = useTranslation('purchase');
    const { t:tCommon} = useTranslation('common');
    const lang = useTranslation().i18n.language.split('-')[0]
    const [totalPage, setTotalPage] = useState(0)
    const [searchParams, setSearchParams] = useSearchParams();

    const getParam = (key: string, defaultValue: string) => searchParams.get(key) ?? defaultValue;

    const [page, setPage] = useState<number>(Number(getParam('page', '1')));
    const [pageSize, setPageSize] = useState<number>(Number(getParam('pageSize', '10')));
    const [selectedDepartment, setSelectedDepartment] = useState(getParam('departmentId', ''));
    const [selectedStatus, setSelectedStatus] = useState(getParam('statusId', ''));
    const [selectedYear, setSelectedYear] = useState(getParam('year', ''));

    const { data: purchases = [], isPending, isError, error } = useQuery({
        queryKey: [
            'get-all-purchase',
            page,
            pageSize,
            selectedDepartment,
            selectedStatus,
            selectedYear
        ],
        queryFn: async () => {
            const res = await purchaseApi.getAll({
                Page: page,
                PageSize: pageSize,
                DepartmentId: selectedDepartment ? Number(selectedDepartment) : null,
                RequestStatusId: selectedStatus ? Number(selectedStatus) : null,
                Year: selectedYear ? Number(selectedYear) : null
            });

            setTotalPage(res.data.total_pages);
            return res.data.data;
        }
    });

    function setCurrentPage(p: number) {
        setPage(p);
        updateSearchParams({ page: p });
    }

    function handlePageSizeChange(size: number) {
        setPage(1);
        setPageSize(size);
        updateSearchParams({ page: 1, pageSize: size });
    }

    const handleOnChangeDepartment = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPage(1);
        setSelectedDepartment(value);
        updateSearchParams({ departmentId: value, page: 1 });
    };

    const handleOnChangeStatus = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPage(1);
        setSelectedStatus(value);
        updateSearchParams({ statusId: value, page: 1 });
    };
    
	const { data: departments = [] } = useQuery({
		queryKey: ['get-all-department'],
		queryFn: async () => {
			const res = await orgUnitApi.GetAllDepartment()
			return res.data.data
		},
	});

    const handleYearChange = (year: string) => {
        setPage(1);
        setSelectedYear(year);
        updateSearchParams({ year, page: 1 });
    };

    const updateSearchParams = (params: Record<string, string | number | null>) => {
        const newParams = new URLSearchParams(searchParams.toString());

        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === '' || value === 0) {
                newParams.delete(key);
            } else {
                newParams.set(key, String(value));
            }
        });

        setSearchParams(newParams);
    };

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <h3 className="font-bold text-xl md:text-2xl m-0">{t('list.title')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                    <Label className="mb-2">{t('list.department')}</Label>
                    <select
                        value={selectedDepartment}
                        onChange={handleOnChangeDepartment}
                        className="border p-1 rounded w-full cursor-pointer"
                    >
                        <option value="">
                            {lang === 'vi' ? 'Tất cả' : 'All'}
                        </option>
                        {departments.map((item: { id: number; name: string }) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label className="mb-2">{t('list.status')}</Label>
                    <select
                        value={selectedStatus}
                        onChange={handleOnChangeStatus}
                        className="border p-1 rounded w-full cursor-pointer"
                    >
                        <option value="">{lang === 'vi' ? 'Tất cả' : 'All'}</option>
                        <option value="3">{lang === 'vi' ? 'Hoàn thành' : 'Completed'}</option>
                        <option value="5">{lang === 'vi' ? 'Từ chối' : 'Rejected'}</option>
                        <option value="10">{lang === 'vi' ? 'Chờ PO' : 'Wait PO'}</option>
                        <option value="11">{lang === 'vi' ? 'Chờ giao hàng' : 'Wait delivery'}</option>
                        <option value="100">{lang === 'vi' ? 'Chờ nhập báo giá' : 'Wait quotation input'}</option>
                        <option value="101">{lang === 'vi' ? 'Chờ duyệt báo giá' : 'Wait quotation approval'}</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-0.5 font-semibold text-sm text-gray-700">
                        {t('statistical.time')}
                    </label>
                    <YearSelect
                        onChange={handleYearChange}
                        defaultYear={selectedYear}
                        className="border p-1 rounded w-full cursor-pointer"
                    />
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
                                        return (
                                            <tr key={item?.id}>
                                                <td className="px-4 py-2 border text-center">
                                                    <Link to={`/view/${item?.applicationForm?.code ?? '1'}?requestType=${item?.applicationForm?.requestTypeId}`} className="text-blue-700 underline">{item?.applicationForm?.code ?? '--'}</Link>
                                                </td>
                                                <td className="px-4 py-2 border text-center">{item?.applicationForm?.userNameCreatedForm ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">{item?.orgUnit?.name ?? '--'}</td>
                                                <td className="px-4 py-2 border text-center">{formatDate(item?.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
                                                <td className="px-4 py-2 border text-center">
                                                    <StatusLeaveRequest status={item?.requestStatusId ?? item?.applicationForm?.requestStatusId}/>
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
                            purchases.map((item: any) => (
                                <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 mt-5">
                                    <div className="mb-1"><strong>{t('list.code')}:</strong> <Link to={`/view/${item?.applicationForm?.code ?? '1'}?requestType=${item?.applicationForm?.requestTypeId}`}>{item?.applicationForm?.code}</Link></div>
                                    <div className="mb-1"><strong>{t('list.user_requestor')}:</strong> {item?.applicationForm?.userNameCreatedForm ?? '--'}</div>
                                    <div className="mb-1"><strong>{t('list.department')}:</strong> {item?.orgUnit?.name}</div>
                                    <div className="mb-1"><strong>{t('list.created_at')}:</strong> {formatDate(item?.createdAt ?? "", "yyyy/MM/dd HH:mm:ss")}</div>
                                    <div className="mb-1"><strong>{t('list.status')}:</strong> <StatusLeaveRequest status={item?.requestStatusId ?? item?.applicationForm?.requestStatusId}/></div>
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