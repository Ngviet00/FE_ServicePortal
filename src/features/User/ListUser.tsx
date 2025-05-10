import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import PaginationControl from "@/components/PaginationControl/PaginationControl"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDate, ShowToast, useDebounce } from "@/lib"
import ButtonDeleteComponent from "@/components/ButtonDeleteComponent"
import userApi, { ListUserData } from "@/api/userApi"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import roleApi, { IRole } from "@/api/roleApi"

import { MultiSelect } from "react-multi-select-component";
import { Spinner } from "@/components/ui/spinner"
import useHasRole from "@/hooks/HasRole"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type Option = {
    value: string;
    label: string;
};

export default function ListUser () {
    const queryClient = useQueryClient();

    const [name, setName] = useState("")
    const debouncedName = useDebounce(name, 300);
    const [totalPage, setTotalPage] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [selectedItem, setSelectedItem] = useState<ListUserData | null>(null);
    
    const [options, setOptions] = useState<Option[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Option[]>([]);
    
    //get list users 
    const { data: users = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-user', debouncedName, page, pageSize],
        queryFn: async () => {
            await delay(Math.random() * 100 + 100);
            const res = await userApi.getAll({
                page: page,
                page_size: pageSize,
                name: debouncedName
            });
            setTotalPage(res.data.total_pages)
            return res.data.data;
        }
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
            ShowToast("Success", "success");
        },
        onError: (error) => {
            console.error("Delete failed:", error);
            ShowToast("Delete failed", "error");
        }
    });

    const handleDelete = async (id: string) => {
        try {
            const shouldGoBack = users.length === 1;
            await mutation.mutateAsync(id);
            handleSuccessDelete(shouldGoBack);
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    //fetch list role
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
    
    const handleSetRole = (item: ListUserData) => {
        const formattedRoles = item.roles.map((role: IRole) => ({
            value: role.id.toString(),
            label: role.name,
        }));
        setSelectedRoles(formattedRoles);
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
                ShowToast("Lỗi không thể cập nhật role, hãy liên hệ team IT", "error", 5000)
                console.log('error update user role', err)
            },
        })
    }

    const selectedLabels = selectedRoles.map(role => role.label).join(', ');

    const isSuperAdmin = useHasRole(['superadmin']);

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">User</h3>
                <Button>
                    <Link to="/user/create">Create User</Link>
                </Button>
            </div>

            <div className="flex items-center justify-start">
                <div className="w-[17%]">
                    <Input
                        placeholder="Tìm kiếm tên, email, số điện thoaị..."
                        value={name}
                        onChange={handleSearchByName}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <div className="mb-5 relative overflow-x-auto shadow-md sm:rounded-lg pb-3">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px] text-center">User Code</TableHead>
                                <TableHead className="w-[180px] text-center">Name</TableHead>
                                <TableHead className="w-[130px] text-center">Department</TableHead>
                                <TableHead className="w-[100px] text-center">Position</TableHead>
                                <TableHead className="w-[150px] text-center">Sex</TableHead>
                                <TableHead className="w-[150px] text-center">Phone</TableHead>
                                <TableHead className="w-[120px] text-center">Email</TableHead>
                                <TableHead className="w-[120px] text-center">Level</TableHead>
                                <TableHead className="w-[120px] text-center">Level Parent</TableHead>
                                <TableHead className="w-[150px] text-center">Date join company</TableHead>
                                <TableHead className="w-[120px] text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            { isPending ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[180px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[130px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[100px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[150px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[150px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                        <TableCell className="w-[120px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300 text-center" /></div></TableCell>
                                        <TableCell className="w-[200px] text-center"><div className="flex justify-center"><Skeleton className="h-4 w-[100px] bg-gray-300" /></div></TableCell>
                                    </TableRow>
                                ))
                            ) : isError || users.length == 0 ? (
                                <TableRow>
                                    <TableCell className={`${isError ? "text-red-700" : "text-black"} font-medium text-center`} colSpan={11}>{error?.message ?? "No results"}</TableCell>
                                </TableRow>
                            ) : (
                                users.map((item: ListUserData) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-center">{item?.code}</TableCell>
                                            <TableCell className="text-center">{item?.name}</TableCell>
                                            <TableCell className="text-center">{item?.department?.name ?? "--"}</TableCell>
                                            <TableCell className="text-center">{item.position ? item.position : "--"}</TableCell>
                                            <TableCell className="text-center">{item?.sex == 1 ? "Nam" : "Nữ"}</TableCell>
                                            <TableCell className="text-center">{item.phone ? item.phone : "--"}</TableCell>
                                            <TableCell className="text-center">{item?.email}</TableCell>
                                            <TableCell className="text-center">{item?.level}</TableCell>
                                            <TableCell className="text-center">{item?.level_parent ?? "--"}</TableCell>
                                            <TableCell className="text-center">{formatDate(item?.date_join_company ?? "", "dd/MM/yyyy")}</TableCell>
                                            <TableCell className="text-center">
                                                {
                                                    isSuperAdmin ? (<>
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => handleSetRole(item)}
                                                            className="text-xs p-[5px] h-[20x] rounded-[5px] bg-black text-white hover:cursor-pointer hover:bg-dark hover:text-white"
                                                        >
                                                            Set role
                                                        </Button>
                                                        <ButtonDeleteComponent id={item.code} onDelete={() => handleDelete(item.id)}/>
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
                                }
                            }}>
                            <DialogContent className="sm:max-w-[50%] h-[250px] flex flex-col top-[20%]">
                                <DialogHeader>
                                    <DialogTitle>Role</DialogTitle>
                                    <DialogDescription></DialogDescription>
                                </DialogHeader>
                                        <MultiSelect
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
                                        <Button type="submit" disabled={updateUserRoleMutation.isPending} onClick={() => handleConfirm(selectedItem.code)} className="bg-blue-600 hover:cursor-pointer hover:bg-blue-600">
                                            {
                                                updateUserRoleMutation.isPending ? <Spinner className="text-white"/> : "Confirm"
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