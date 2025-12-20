/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAuthStore } from "@/store/authStore"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import terminationLetterApi, { useHRConfirmAbsent } from "@/api/HR/terminationLetterApi"
import ModalConfirm from "@/components/ModalConfirm"
// import { Link } from "react-router-dom"

export default function ListAbsentOverDay () {
    const { t } = useTranslation('hr')
    const { t: tCommon } = useTranslation('common')
    // const lang = useTranslation().i18n.language.split('-')[0]
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const {user} = useAuthStore()
    const queryClient = useQueryClient();
    const [statusModalConfirm, setStatusModalConfirm] = useState('')
    const [selectedUser, setSelectedUser] = useState<any | null>(null)

    const { data: listAbsentWithoutNotices = [], isPending, isError, error } = useQuery({
        queryKey: ['get-list-absent-without-notice', user?.userCode, page, pageSize ],
        queryFn: async () => {
            const res = await terminationLetterApi.getListAbsentOverDay({
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

    const handleClickConfirm = (type: string, userSelected: any) => {
        setStatusModalConfirm(type)
        setSelectedUser(userSelected)
    }  

    function handleSuccessDelete(shouldGoBack?: boolean) {
        queryClient.invalidateQueries({
            queryKey: ['get-list-absent-without-notice', user?.userCode],
        });

        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        }
    }

    const hrConfirmAbsent = useHRConfirmAbsent()
    const handleSaveModalConfirm = async () => {
        const payload = {
            userCode: selectedUser?.nvMaNV ?? '',
            lastAbsentDate: selectedUser?.ngayNghiGanNhat ?? '',
            status: statusModalConfirm == 'terminate',
            userConfirm: user?.userName ?? ''
        }

        setStatusModalConfirm('')
        setSelectedUser(null)

        await hrConfirmAbsent.mutateAsync(payload)

        const shouldGoBack = listAbsentWithoutNotices.length === 1;
        handleSuccessDelete(shouldGoBack);
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                <h3 className="font-bold text-xl md:text-2xl m-0">
                    {t('absent_overday.title')}
                </h3>
            </div>

            <ModalConfirm
                type={statusModalConfirm}
                isOpen={statusModalConfirm != ''}
                onClose={() => setStatusModalConfirm('')}
                onSave={handleSaveModalConfirm}
                isPending={hrConfirmAbsent.isPending}
            />

            <div className="mb-5 pb-3">
                <div className="mt-2">
                    <div className="overflow-x-auto max-h-[600px] hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f3f4f6] border">
                                    <TableHead className="w-[100px] text-center border">{t('absent_overday.user_code')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('absent_overday.username')}</TableHead>
                                    <TableHead className="w-[130px] text-center border">{t('absent_overday.department')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('absent_overday.last_absent_date')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('absent_overday.list_absent_date')}</TableHead>
                                    <TableHead className="w-[150px] text-center border">{t('absent_overday.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                        <TableBody>
                            {isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <TableCell key={i} className="border">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-4 w-[100px] bg-gray-300" />
                                                </div>
                                            </TableCell>
                                        ))}
                                        </TableRow>
                                    ))
                                ) : isError || listAbsentWithoutNotices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-red-700 border text-center font-medium dark:text-white">
                                            { error?.message ?? tCommon('no_results') } 
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    listAbsentWithoutNotices.map((item: any, idx: number) => {
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell className="text-center border">{item?.nvMaNV}</TableCell>
                                                <TableCell className="text-center border">{item?.nvHoTen}</TableCell>
                                                <TableCell className="text-center border">{item?.boPhan}</TableCell>
                                                <TableCell className="text-center border">{formatDate(item?.ngayNghiGanNhat ?? "", "yyyy-MM-dd") }</TableCell>
                                                <TableCell className="text-center border">{item?.top5NgayABS}</TableCell>
                                                <TableCell className="text-center border">
                                                    {/* <Link className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded-[3px] text-sm mr-3 cursor-pointer" to={`/termination/create?usercode=${item?.nvMaNV}`}>
                                                        {lang == 'vi' ? 'Chấm dứt hợp đồng' : 'Make termination letter'}
                                                    </Link> */}
                                                    <button
                                                        onClick={() => handleClickConfirm('working', item)}
                                                        disabled={hrConfirmAbsent.isPending}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-[3px] text-sm mr-3 cursor-pointer disabled:bg-gray-400"
                                                    >
                                                        {t('absent_overday.working')}
                                                    </button>
                                                    <button 
                                                        disabled={hrConfirmAbsent.isPending}
                                                        onClick={() => handleClickConfirm('terminate', item)} 
                                                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-[3px] text-sm cursor-pointer disabled:bg-gray-400"
                                                    >
                                                        {t('absent_overday.terminate')}
                                                    </button>
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
                                    <div key={index} className="border rounded p-4 space-y-2 shadow bg-white dark:bg-gray-800">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                                        ))}
                                    </div>
                                ))
                            ) : isError || listAbsentWithoutNotices.length === 0 ? (
                                <div className="p-2 text-red-700 border text-center font-medium dark:text-white mt-5">{ error?.message ?? tCommon('no_results') } </div>
                            ) : (
                                listAbsentWithoutNotices.map((item: any) => {
                                    return (
                                        <div key={item.id} className="border rounded p-4 shadow bg-white dark:bg-gray-800 space-y-1">
                                            <div>
                                                <strong>{t('absent_overday.user_code')}: </strong>
                                                {item?.nvMaNV}
                                            </div>
                                            <div>
                                                <strong>{t('absent_overday.username')}: </strong>
                                                {item?.nvHoTen}
                                            </div>
                                            <div>
                                                <strong>{t('absent_overday.department')}: </strong>
                                                {item?.boPhan}
                                            </div>
                                            <div>
                                                <strong>{t('absent_overday.last_absent_date')}: </strong>
                                                {formatDate(item?.ngayNghiGanNhat ?? "", "yyyy-MM-dd") }
                                            </div>
                                            <div>
                                                <strong>{t('absent_overday.list_absent_date')}: </strong>
                                                {item?.top5NgayABS}
                                            </div>
                                            <div>
                                                <strong>{t('absent_overday.action')}: </strong>
                                                <button
                                                    onClick={() => handleClickConfirm('working', item)}
                                                    disabled={hrConfirmAbsent.isPending}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-[3px] text-sm mr-3 cursor-pointer disabled:bg-gray-400"
                                                >
                                                    {t('absent_overday.working')}
                                                </button>
                                                <button 
                                                    disabled={hrConfirmAbsent.isPending}
                                                    onClick={() => handleClickConfirm('terminate', item)} 
                                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-[3px] text-sm cursor-pointer disabled:bg-gray-400"
                                                >
                                                    {t('absent_overday.terminate')}
                                                </button>
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
                listAbsentWithoutNotices.length > 0 ? (<PaginationControl
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