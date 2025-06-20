import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getErrorMessage, ShowToast, useDebounce } from "@/lib"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MultiSelect } from "react-multi-select-component";
import { Spinner } from "@/components/ui/spinner"
import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import userApi, { GetListUserData, useResetPassword } from "@/api/userApi"
import roleApi, { IRole } from "@/api/roleApi"
import useHasRole from "@/hooks/HasRole"
import { useTranslation } from "react-i18next"
import { formatDate } from "@/lib/time"
import { Label } from "@/components/ui/label"
import departmentApi from "@/api/departmentApi"
import positionApi from "@/api/positionApi"

type Option = {
    value: string;
    label: string;
};

export default function ListUser () {
    const { t } = useTranslation();
    const [name, setName] = useState("")
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedItem, setSelectedItem] = useState<GetListUserData | null>(null)
    const [selectTypeModal, setSelectTypeModal] = useState("")
    const [options, setOptions] = useState<Option[]>([])
    const [selectedRoles, setSelectedRoles] = useState<Option[]>([])
    const [passwordReset, setNewPasswordReset] = useState("")
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('');
    const [selectedSex, setSelectedSex] = useState('');

    const queryClient = useQueryClient();
    const debouncedName = useDebounce(name, 300);
    const resetPassword = useResetPassword();
    
    //get list users 
    const { data: users = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-user', debouncedName, page, pageSize, selectedSex, selectedPosition, selectedDepartment],
        queryFn: async () => {
            const res = await userApi.getAll({
                page: page,
                page_size: pageSize,
                name: debouncedName,
                sex: selectedSex,
                positionId: selectedPosition,
                departmentId: selectedDepartment
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        }
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-department'],
        queryFn: async () => {
            const res = await departmentApi.getAll()
            return res.data.data
        },
    });

    const { data: positions = [] } = useQuery({
        queryKey: ['get-all-position'],
        queryFn: async () => {
            const res = await positionApi.getAll()
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

    const { data: roles = [] } = useQuery({
        queryKey: ['list-roles'],
        queryFn: async () => {
            const res = await roleApi.getAll({page: 1, page_size: 200});
            return res.data.data;
        }
    });

    useEffect(() => {
        if (roles && roles.length > 0) {
            const formattedOptions = roles.map((role: IRole) => ({
                value: role.id.toString(),
                label: role.name,
            }));
            setOptions(formattedOptions);
        }
    }, [roles]);
    
    const handleRoleChange = (selected: Option[]) => {
        setSelectedRoles(selected);
    };
    
    const handleShowModal = (item: GetListUserData, type: string) => {
        if (type == "role") {
            const formattedRoles = item.roles.map((role: IRole) => ({
                value: role.id.toString(),
                label: role.name,
            }));
            setSelectedRoles(formattedRoles);
            
        } else {
            console.log(1);
        }
        setSelectTypeModal(type)
        setSelectedItem(item);
    }

    const updateUserRoleMutation = useMutation({ mutationFn: userApi.updateUserRole });

    const handleConfirm = (userCode: string) => {
        const roleIds = selectedRoles.map((role) => Number(role.value));
        
        const payload = {             
            user_code: userCode,
            role_ids: roleIds
        }

        updateUserRoleMutation.mutate(payload, {
            onSuccess: () => {
                ShowToast("Thành công!")
                setSelectedItem(null)
                queryClient.invalidateQueries({ queryKey: ['get-all-user'] });
            },
            onError: (err) => {
                ShowToast(getErrorMessage(err), "error")
            },
        })
    }

    const selectedLabels = selectedRoles.map(role => role.label).join(', ');
    const isSuperAdmin = useHasRole(['superadmin']);

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
            <div className="flex flex-col md:flex-row items-center justify-start md:justify-between gap-4 p-4 dark:bg-gray-800 rounded-lg">
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
                            departments.map((dept: {bpMa: number, bpTen: string}) => (
                                <option key={dept.bpMa} value={dept.bpMa}>{dept.bpTen}</option>
                            ))
                        }
                    </select>
                </div>
                <div className="w-full md:w-1/4">
                    <Label htmlFor="position" className="mb-1">Position</Label>
                    <select
                        value={selectedPosition}
                        id="position"
                        onChange={(e) => setSelectedPosition(e.target.value)}
                        className="dark:bg-[#454545] shadow-xs border border-[#ebebeb] p-2 rounded-[5px] w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">--Chọn--</option>
                        {
                            positions.map((pos: {cvMa: number, cvTen: string}) => (
                                <option key={pos.cvMa} value={pos.cvMa}>{pos.cvTen}</option>
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
                                <TableHead className="w-[100px] text-left">{t('list_user_page.position')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_user_page.sex')}</TableHead>
                                <TableHead className="w-[150px] text-left">{t('list_user_page.phone')}</TableHead>
                                <TableHead className="w-[120px] text-left">{t('list_user_page.email')}</TableHead>
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
                                        <TableCell className="w-[100px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[150px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[150px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[120px] text-left"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
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
                                            <TableCell className="text-left">{item?.cvTen ?? "--"}</TableCell>
                                            <TableCell className="text-left">{item?.nvGioiTinh == false ? "Male" : "Female"}</TableCell>
                                            <TableCell className="text-left">{item?.nvDienThoai ? item.nvDienThoai : "--"}</TableCell>
                                            <TableCell className="text-left">{item?.nvEmail ? item?.nvEmail : "--"}</TableCell>
                                            <TableCell className="text-left">{item?.nvNgayVao ? formatDate(item?.nvNgayVao, "dd/MM/yyyy") : "--"}</TableCell>
                                            <TableCell className="text-left">
                                                {
                                                    isSuperAdmin ? (<>
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => handleShowModal(item, "role")}
                                                            className="text-xs p-[5px] h-[20x] rounded-[5px] bg-blue-900 text-white hover:cursor-pointer hover:bg-dark hover:text-white"
                                                        >
                                                            Set role
                                                        </Button>
                                                        <Button
                                                            variant="outline" 
                                                            onClick={() => handleShowModal(item, "reset")}
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
                                    <DialogTitle>{selectTypeModal == "role" ? "Role" : "Reset Password"}</DialogTitle>
                                    <DialogDescription></DialogDescription>
                                </DialogHeader>
                                    {
                                        selectTypeModal == "role" ?
                                        (
                                            <>
                                                <MultiSelect
                                                    className="dark:text-black"
                                                    options={options}
                                                    value={selectedRoles}
                                                    onChange={handleRoleChange}
                                                    labelledBy="Select"
                                                    hasSelectAll={false}
                                                    overrideStrings={{
                                                        selectSomeItems: "Chọn vai trò...",
                                                        search: "Tìm kiếm...",
                                                        clearSearch: "Xoá tìm kiếm",
                                                        noOptions: "Không có vai trò nào",
                                                        allItemsAreSelected: selectedLabels || "Chọn vai trò..."
                                                    }}
                                                />
                                                <div className="flex justify-end">
                                                    <Button type="submit" disabled={updateUserRoleMutation.isPending} onClick={() => handleConfirm(selectedItem.userCode)} className="bg-blue-600 hover:cursor-pointer hover:bg-blue-600">
                                                        {
                                                            updateUserRoleMutation.isPending ? <Spinner className="text-white"/> : "Confirm"
                                                        }
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (<>
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
                                        </>)
                                    }
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