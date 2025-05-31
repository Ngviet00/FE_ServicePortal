import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import timekeepingApi, { useSaveManageTimeKeeping } from "@/api/timeKeeping";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import PaginationControl from "@/components/PaginationControl/PaginationControl";

interface ListUserToChooseManageData {
    userCode: string,
    isCheckedHaveManageUserTimeKeeping: boolean
}

export default function MgnTimeKeepingDialog() {
    const [openModal, setOpenModal] = useState(false);
    const { user } = useAuthStore()
    const [nameSearch, setNameSearch] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalPage, setTotalPage] = useState(0)
    const [userCodeSelected, setUserCodeSelected] = useState<string[]>([]);
    const debouncedName = useDebounce(nameSearch, 300);
    const saveManageTimeKeeping = useSaveManageTimeKeeping()
    const didInitCheckboxState = useRef(false);

    const { data: dataUserCodeSelected } = useQuery({
        queryKey: ['get-list-usercode-selected'],
        queryFn: async () => {
            const res = await timekeepingApi.GetListUserCodeSelected({
                UserCodeManage: user?.userCode ?? "",
            })
            return res.data.data
        },
        enabled: openModal
    });

    useEffect(() => {
        if (openModal && dataUserCodeSelected) {
            setUserCodeSelected(dataUserCodeSelected);
        }
    }, [openModal, dataUserCodeSelected]);

    const { data: dataUserToChooseManage, isPending, isError, error } = useQuery({
        queryKey: ['get-list-user-to-choose-manage-time-keeping', debouncedName, page, pageSize],
        queryFn: async () => {
            const res = await timekeepingApi.GetListUserToChooseManage({
                Position: user?.positionId,
                UserCode: user?.userCode ?? "",
                Name: debouncedName,
                Page: page,
                PageSize: pageSize,
            })
            setTotalPage(res.data.total_pages)
            return res.data.data
        },
        enabled: openModal
    });

    const handleCheckAll = (checked: boolean) => {
        if (checked) {
            const newCodes = dataUserToChooseManage.map((u: ListUserToChooseManageData) => u.userCode);
            setUserCodeSelected(prev => Array.from(new Set([...prev, ...newCodes])));
        } else {
            const currentPageUserCodes = dataUserToChooseManage.map((u: ListUserToChooseManageData) => u.userCode);
            setUserCodeSelected(prev => prev.filter(code => !currentPageUserCodes.includes(code)));
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameSearch(e.target.value)
    }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const handleOnCheckedChange = async (checked: boolean, userData: ListUserToChooseManageData) => {
        setUserCodeSelected(prev => {
            if (checked) return [...prev, userData.userCode];
            return prev.filter(code => code !== userData.userCode);
        });
    };

    const allSelectedOnCurrentPage = Array.isArray(dataUserToChooseManage) &&  dataUserToChooseManage?.length > 0 &&
        dataUserToChooseManage.every(u => userCodeSelected.includes(u.userCode));

    const handleSaveManageUserTimeKeeping = async () => {
        await saveManageTimeKeeping.mutateAsync({
            UserCodeManage: user?.userCode ?? null,
            UserCodes: userCodeSelected
        });

        setOpenModal(false)

        window.location.reload()
    }

    useEffect(() => {
        if (!openModal) {
            setUserCodeSelected([]);
        }
    }, [openModal]);

    useEffect(() => {
        setUserCodeSelected([]);
        didInitCheckboxState.current = false;
    }, [user?.userCode]);

    return (
        <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger className="hover:cursor-pointer bg-black text-white px-4 py-1 rounded-[8px]">
                TimeKeeping User
            </DialogTrigger>
            <DialogContent className="h-[80%] block" style={{ maxWidth: '60em' }}>
                <DialogHeader>
                    <DialogTitle>Choose user</DialogTitle>
                </DialogHeader>
                <div className="w-full">
                    <div className="flex items-end">
                        <div className="flex-1 mr-2">
                        <Label className="my-2">Search</Label>
                        <Input type="text" className="border" placeholder="Search..." value={nameSearch} onChange={handleSearch} />
                        </div>
                        <Button disabled={saveManageTimeKeeping.isPending} onClick={handleSaveManageUserTimeKeeping}>
                        {saveManageTimeKeeping.isPending ? <Spinner className="text-white" /> : 'Save'}
                        </Button>
                    </div>

                    <div className="table-responsive" style={{ maxHeight: '450px', overflowX: 'auto' }}>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[50px] text-left">
                                <Checkbox
                                className="bg-gray-300"
                                checked={allSelectedOnCurrentPage}
                                onCheckedChange={(checked) => handleCheckAll(!!checked)}
                                />
                            </TableHead>
                            <TableHead className="w-[150px] text-left">UserCode</TableHead>
                            <TableHead className="w-[150px] text-left">Name</TableHead>
                            <TableHead className="w-[150px] text-left">Department</TableHead>
                            <TableHead className="w-[150px] text-left">Position</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isPending ? (
                            Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={index}>
                                {Array.from({ length: 5 }).map((__, i) => (
                                    <TableCell key={i} data-label="">
                                    <div className="flex justify-center">
                                        <Skeleton className="h-4 w-[80px] bg-gray-300" />
                                    </div>
                                    </TableCell>
                                ))}
                                </TableRow>
                            ))
                            ) : isError || dataUserToChooseManage.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className={`${isError ? 'text-red-700' : 'text-black'} font-medium text-center`}>
                                {error?.message ?? 'No results'}
                                </TableCell>
                            </TableRow>
                            ) : (
                            dataUserToChooseManage.map((item: ListUserToChooseManageData, idx: number) => (
                                <TableRow key={idx}>
                                <TableCell data-label="Select">
                                    <Checkbox
                                    className="bg-gray-300"
                                    value={item.userCode}
                                    checked={userCodeSelected.includes(item.userCode)}
                                    onCheckedChange={(checked) => handleOnCheckedChange(!!checked, item)}
                                    />
                                </TableCell>
                                <TableCell data-label="UserCode">{item.userCode}</TableCell>
                                <TableCell data-label="Name">Name - {item.userCode}</TableCell>
                                <TableCell data-label="Department">Department - {item.userCode}</TableCell>
                                <TableCell data-label="Position">Position - {item.userCode}</TableCell>
                                </TableRow>
                            ))
                            )}
                        </TableBody>
                        </Table>
                    </div>

                    {dataUserToChooseManage && dataUserToChooseManage.length > 0 && (
                        <PaginationControl
                        currentPage={page}
                        totalPages={totalPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={handlePageSizeChange}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}