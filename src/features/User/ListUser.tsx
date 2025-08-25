import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getErrorMessage, RoleEnum, ShowToast, useDebounce } from "@/lib"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import userApi, { GetListUserData, useResetPassword } from "@/api/userApi"
import useHasRole from "@/hooks/useHasRole"
import { useTranslation } from "react-i18next"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import orgUnitApi from "@/api/orgUnitApi"

export default function ListUser () {
    const { t } = useTranslation();
    const { t: tCommon } = useTranslation('common')
    const lang = useTranslation().i18n.language.split('-')[0]
    const [name, setName] = useState("")
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedItem, setSelectedItem] = useState<GetListUserData | null>(null)
    const [passwordReset, setNewPasswordReset] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSex, setSelectedSex] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const debouncedName = useDebounce(name, 300);
    const resetPassword = useResetPassword();
    
    //get list users 
    const { data: users = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-user', debouncedName, page, pageSize, selectedSex, selectedDepartment, selectedStatus],
        queryFn: async () => {
            const res = await userApi.getAll({
                Page: page,
                PageSize: pageSize,
                Name: debouncedName,
                Sex: selectedSex == '' ? null : Number(selectedSex),
                DepartmentId: selectedDepartment == '' ? null : Number(selectedDepartment),
                Status: selectedStatus == '' ? null : Number(selectedStatus)
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        }
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-departments'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res.data.data
        },
    });

    useEffect(() => {
        setPage(1);
    }, [debouncedName]);

    const handleSearchByName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPage(1)
        setName(e.target.value)
    }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }
    
    const handleShowModal = (item: GetListUserData) => {
        setSelectedItem(item);
    }

    const isSuperAdmin = useHasRole([RoleEnum.SUPERADMIN]);

    const handleResetPassword = async (item: GetListUserData) => {
        try {
            await resetPassword.mutateAsync({ userCode: item.nvMaNV, password: passwordReset });
            setSelectedItem(null)
        }
        catch (err) {
            ShowToast(getErrorMessage(err), "error")
        }
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">{t('list_user_page.title')}</h3>
            </div>
            <div className="flex flex-col md:flex-row items-start justify-start md:justify-start gap-4 p-4 pl-0 dark:bg-gray-800 rounded-lg">
                <div className="w-full md:w-1/4">
                    <Label htmlFor="search" className="mb-1">{t('list_user_page.search')}</Label>
                    <Input
                        id="search"
                        placeholder={t('list_user_page.search')}
                        value={name}
                        onChange={handleSearchByName}
                        className="w-full"
                    />
                </div>
                <div className="w-full md:w-1/4">
                    <Label htmlFor="department" className="mb-1">{t('list_user_page.department')}</Label>
                    <select
                        value={selectedDepartment}
                        id="department"
                        onChange={(e) => {
                            setPage(1)
                            setSelectedDepartment(e.target.value)}
                        }
                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-2 rounded-[5px] w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">--Chọn--</option>
                        {
                            departments.map((item: {id: number, name: string}) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <Label htmlFor="sex" className="mb-1">{t('list_user_page.sex')}</Label>
                    <select
                        value={selectedSex}
                        onChange={(e) => {
                            setPage(1)
                            setSelectedSex(e.target.value)}
                        }
                        id="sex"
                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-2 rounded-[5px] w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">--{t('list_user_page.select')}--</option>
                        <option value="0">{t('list_user_page.male')}</option>
                        <option value="1">{t('list_user_page.female')}</option>
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <Label htmlFor="sex" className="mb-1">{t('list_user_page.status_user')}</Label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setPage(1)
                            setSelectedStatus(e.target.value)}
                        }
                        id="sex"
                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-2 rounded-[5px] w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">--{t('list_user_page.select')}--</option>
                        <option value="1">{t('list_user_page.active')}</option>
                        <option value="2">{t('list_user_page.in_active')}</option>
                    </select>
                </div>
            </div>
            <div className="mt-5">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="w-[160px] px-4 py-2 border">{t('list_user_page.usercode')}</th>
                                <th className="w-[180px] px-4 py-2 border">{t('list_user_page.name')}</th>
                                <th className="w-[130px] px-4 py-2 border">{t('list_user_page.department')}</th>
                                <th className="w-[150px] px-4 py-2 border">{t('list_user_page.sex')}</th>
                                <th className="w-[150px] px-4 py-2 border">{t('list_user_page.phone')}</th>
                                <th className="w-[120px] px-4 py-2 border">{t('list_user_page.email')}</th>
                                <th className="w-[150px] px-4 py-2 border">{t('list_user_page.dob')}</th>
                                <th className="w-[150px] px-4 py-2 border">{t('list_user_page.date_join_company')}</th>
                                <th className="w-[150px] px-4 py-2 border">{t('list_user_page.status_user')}</th>
                                <th className="w-[150px] px-4 py-2 border">{t('list_user_page.termination_date')}</th>
                                <th className="w-[120px] px-4 py-2 border">{t('list_user_page.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></td>
                                            <td className="px-4 py-2 border whitespace-nowrap text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></td>
                                        </tr>  
                                    ))
                                ) : isError || users.length == 0 ? (
                                        <tr>
                                            <td colSpan={11} className="px-4 py-2 text-center font-bold text-red-700">
                                                { error?.message ?? tCommon('no_results') } 
                                            </td>
                                        </tr>
                                ) : (
                                    users.map((item: GetListUserData, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className=" px-4 py-2 border whitespace-nowrap font-medium text-center">{item?.nvMaNV}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">{item?.nvHoTen}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">{item?.departmentName}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">{item?.nvGioiTinh}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">{item?.nvDienThoai ? item.nvDienThoai : "--"}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">{item?.nvEmail ? item?.nvEmail : "--"}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">{item?.nvNgaySinh ?? "--"}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">{item.nvNgayVao ?? "--"}</td>
                                            <td className={`${item.statusUser == true ? 'text-green-800' : 'text-red-500'} font-semibold px-4 py-2 border whitespace-nowrap text-center`}>{item.statusUser == true ? t('list_user_page.active') : t('list_user_page.in_active')}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">{item.statusUser == false ? item.nvNgayRa : "--"}</td>
                                            <td className=" px-4 py-2 border whitespace-nowrap text-center">
                                                {
                                                    isSuperAdmin ? (<>
                                                        <Link to={`/user/role-and-permission/${item?.nvMaNV}`} className="bg-blue-900 px-2 py-1.5 rounded text-white text-xs font-bold">
                                                            Role
                                                        </Link>
                                                        <Button
                                                            variant="outline" 
                                                            onClick={() => handleShowModal(item)}
                                                            className="ml-2 text-xs p-[5px] h-[20x] rounded-[5px] bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white"
                                                        >
                                                            Reset PW
                                                        </Button>
                                                    </>
                                                    ) : "--"
                                                }
                                            </td>
                                        </tr>
                                    ))    
                                )
                            }
                        </tbody>
                    </table>
                    {selectedItem && (
                        <Dialog 
                            open={!!selectedItem} 
                            onOpenChange={(open) => {
                                if (!open) {
                                    setSelectedItem(null)
                                    setNewPasswordReset("")
                                }
                            }}>
                            <DialogContent className="sm:max-w-[50%] h-[250px] flex flex-col top-[20%]">
                                <DialogHeader>
                                    <DialogTitle>{lang == 'vi' ? 'Đặt lại mật khẩu' : 'Reset password'}</DialogTitle>
                                    <DialogDescription></DialogDescription>
                                </DialogHeader>
                                    <div className="flex flex-col items-end gap-2 mb-3">
                                        <Input 
                                            placeholder={lang == 'vi' ? 'Nhập mật khẩu' : 'Input'}
                                            value={passwordReset} 
                                            onChange={(e) => {setNewPasswordReset(e.target.value)}} className="mb-3"
                                        />
                                        <Button type="submit" disabled={resetPassword.isPending} onClick={() => handleResetPassword(selectedItem)} className="bg-blue-600 hover:cursor-pointer hover:bg-blue-600">
                                            {
                                                resetPassword.isPending ? <Spinner className="text-white"/> : lang == 'vi' ? 'Xác nhận' : 'Confirm'
                                            }
                                        </Button>
                                    </div>
                                </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
            {
                users.length > 0 ? (<PaginationControl
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