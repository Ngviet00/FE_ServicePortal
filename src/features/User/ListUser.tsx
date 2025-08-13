import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage, RoleEnum, ShowToast, useDebounce } from "@/lib"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import userApi, { GetListUserData, useResetPassword } from "@/api/userApi"
import useHasRole from "@/hooks/useHasRole"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import orgUnitApi from "@/api/orgUnitApi"

export default function ListUser () {
    const { t } = useTranslation();
    const [name, setName] = useState("")
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedItem, setSelectedItem] = useState<GetListUserData | null>(null)
    const [passwordReset, setNewPasswordReset] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSex, setSelectedSex] = useState('');

    const queryClient = useQueryClient();
    const debouncedName = useDebounce(name, 300);
    const resetPassword = useResetPassword();
    
    //get list users 
    const { data: users = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-user', debouncedName, page, pageSize, selectedSex, selectedDepartment],
        queryFn: async () => {
            const res = await userApi.getAll({
                page: page,
                page_size: pageSize,
                name: debouncedName,
                sex: selectedSex,
                departmentName: selectedDepartment
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

    function handleSuccessDelete(shouldGoBack?: boolean) {
        if (shouldGoBack && page > 1) {
            setPage(prev => prev - 1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['get-all-user'] });
        }
    }

    const handleSearchByName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const mutation = useMutation({
        mutationFn: async (id: string) => {
            await userApi.delete(id);
        },
        onSuccess: () => {
            ShowToast("Success");
        },
        onError: (error) => {
            ShowToast(getErrorMessage(error), "error");
        }
    });

    const handleDelete = async (id: string) => {
        try {
            const shouldGoBack = users.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            ShowToast(getErrorMessage(error), "error");
        }
    };
    
    const handleShowModal = (item: GetListUserData) => {
        setSelectedItem(item);
    }

    const isSuperAdmin = useHasRole([RoleEnum.SUPERADMIN]);

    const handleResetPassword = async (item: GetListUserData) => {
        try {
            await resetPassword.mutateAsync({ userCode: item.userCode, password: passwordReset });
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
                    <Label htmlFor="search" className="mb-1">Search</Label>
                    <Input
                        id="search"
                        placeholder={t('list_user_page.search')}
                        value={name}
                        onChange={handleSearchByName}
                        className="w-full"
                    />
                </div>
                <div className="w-full md:w-1/4">
                    <Label htmlFor="department" className="mb-1">Department</Label>
                    <select
                        value={selectedDepartment}
                        id="department"
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-2 rounded-[5px] w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">--Chọn--</option>
                        {
                            departments.map((item: {deptId: number, name: string}) => (
                                <option key={item.deptId} value={item.deptId}>{item.name}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <Label htmlFor="sex" className="mb-1">Sex</Label>
                    <select
                        value={selectedSex}
                        onChange={(e) => setSelectedSex(e.target.value)}
                        id="sex"
                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-2 rounded-[5px] w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">--Chọn--</option>
                        <option value="0">Nam</option>
                        <option value="1">Nữ</option>
                    </select>
                </div>
            </div>
            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px] text-left">{t('list_user_page.usercode')}</TableHead>
                                <TableHead className="w-[180px] text-left">{t('list_user_page.name')}</TableHead>
                                <TableHead className="w-[130px] text-left">{t('list_user_page.department')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_user_page.sex')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_user_page.phone')}</TableHead>
                                <TableHead className="w-[120px] text-left">{t('list_user_page.email')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_user_page.dob')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_user_page.date_join_company')}</TableHead>
                                <TableHead className="w-[120px] text-left">{t('list_user_page.action')}</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            { isPending ? (
                                Array.from({ length: 10 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[180px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[130px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[150px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[150px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[200px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                    </TableRow>
                                ))
                            ) : isError || users.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={9}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) : (
                                users.map((item: GetListUserData) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-left">{item?.userCode}</TableCell>
                                            <TableCell className="text-left">{item?.nvHoTen}</TableCell>
                                            <TableCell className="text-left">{item?.bpTen}</TableCell>
                                            <TableCell className="text-left">{item?.nvGioiTinh == false ? "Male" : "Female"}</TableCell>
                                            <TableCell className="text-left">{item?.phone ? item.phone : "--"}</TableCell>
                                            <TableCell className="text-left">{item?.email ? item?.email : "--"}</TableCell>
                                            <TableCell className="text-left">{item?.dateOfBirth ? formatDate(item?.dateOfBirth, "dd/MM/yyyy") : "--"}</TableCell>
                                            <TableCell className="text-left">{item?.nvNgayVao ? formatDate(item?.nvNgayVao, "dd/MM/yyyy") : "--"}</TableCell>
                                            <TableCell className="text-left">
                                                {
                                                    isSuperAdmin ? (<>
                                                        <Link to={`/user/role-and-permission/${item?.userCode}`} className="bg-blue-900 px-2 py-1.5 rounded text-white text-xs font-bold">
                                                            Role
                                                        </Link>
                                                        <Button
                                                            variant="outline" 
                                                            onClick={() => handleShowModal(item)}
                                                            className="ml-2 text-xs p-[5px] h-[20x] rounded-[5px] bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white"
                                                        >
                                                            Reset PW
                                                        </Button>
                                                        
                                                        <ButtonDeleteComponent id={item.userCode} onDelete={() => handleDelete(item.id)}/>
                                                    </>
                                                    ) : "--"
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            }
                        </TableBody>
                    </Table>
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
                                    <DialogTitle>Reset Password</DialogTitle>
                                    <DialogDescription></DialogDescription>
                                </DialogHeader>
                                    <div className="flex flex-col items-end gap-2 mb-3">
                                        <Input 
                                            placeholder="Nhập mật khẩu"
                                            value={passwordReset} 
                                            onChange={(e) => {setNewPasswordReset(e.target.value)}} className="mb-3"
                                        />
                                        <Button type="submit" disabled={resetPassword.isPending} onClick={() => handleResetPassword(selectedItem)} className="bg-blue-600 hover:cursor-pointer hover:bg-blue-600">
                                            {
                                                resetPassword.isPending ? <Spinner className="text-white"/> : "Confirm"
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