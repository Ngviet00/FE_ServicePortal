import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { GenericAsyncMultiSelect, OptionType } from "@/components/ComponentCustom/MultipleSelect";
import { ShowToast, useDebounce } from "@/lib";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/authStore";
import { ArrowRight, X } from "lucide-react";
import departmentApi from "@/api/departmentApi";
import PaginationControl from "@/components/PaginationControl/PaginationControl";
import HrManagementApi, { useSaveAssignAttendanceManagerToUser, useSaveAttendanceMultiplePeopleToAttendanceManager, useSaveChangeManageAttendance, useSaveHRMangement } from "@/api/HrManagementApi";

export default function HRManagementTimekeeping () {
    const { user } = useAuthStore()
    const { t } = useTranslation();
    const [name, setName] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [totalPage, setTotalPage] = useState(0)
    const [toggleShowManageAll, setToggleShowManageAll] = useState(false)
    const queryClient = useQueryClient();
    const debouncedName = useDebounce(name, 300);

    //#region HR management
    const [selectedHRTimekeeping, setSelectedHRTimekeeping] = useState<OptionType[]>([]);
    const [selectedHRTraining, setSelectedHRTraining] = useState<OptionType[]>([]);
    const [selectedHRRecruitment, setSelectedHRRecruitment] = useState<OptionType[]>([]);
    const saveHrManagement = useSaveHRMangement()

    const { data: ListHr = [] } = useQuery({
        queryKey: ['get-list-hr'],
        queryFn: async () => {
            const res = await HrManagementApi.getAllHR()
            return res.data.data.map((u: { NVHoTen: string; NVMaNV: string }) => ({
                label: `${u.NVHoTen}`,
                value: u.NVMaNV,
            }));
        },
    });

    const { data: HrManagements = [] } = useQuery({
        queryKey: ['get-all-hr-management'],
        queryFn: async () => {
            const res = await HrManagementApi.getHrManagement()
            return res.data.data
        },
    });

    useEffect(() => {
        if (HrManagements && HrManagements.length > 0) {
            const mngTimeKeeping = HrManagements
            .filter((item: {type: string}) => item.type == 'MANAGE_TIMEKEEPING')
            .map((u: { userName: string; userCode: string, type: string }) => ({
                label: `${u.userName}`,
                value: u.userCode,
            }))

            const mngTraining = HrManagements
            .filter((item: {type: string}) => item.type == 'MANAGE_TRAINING')
            .map((u: { userName: string; userCode: string, type: string }) => ({
                label: `${u.userName}`,
                value: u.userCode,
            }))

            const mngRecruitment = HrManagements
            .filter((item: {type: string}) => item.type == 'MANAGE_RECRUITMENT')
            .map((u: { userName: string; userCode: string, type: string }) => ({
                label: `${u.userName}`,
                value: u.userCode,
            }))

            setSelectedHRTimekeeping(mngTimeKeeping)
            setSelectedHRTraining(mngTraining)
            setSelectedHRRecruitment(mngRecruitment)
        }
    }, [HrManagements])

    const handleSaveHrManagement = async () => {
        await saveHrManagement.mutateAsync({
            ManageTimekeeping: selectedHRTimekeeping,
            ManageTraining: selectedHRTraining,
            ManageRecruitment: selectedHRRecruitment
        });
    }
    //#endregion

    //#region CHANGE OLD TO NEW ATTENDANCE MANAGER 
    const [selectedOldMngAttendance, setSelectedOldMngAttendance] = useState<OptionType[]>();
    const [selectedNewMngAttendance, setSelectedNewMngAttendance] = useState<OptionType[]>();

    const saveChangeManageAttendance = useSaveChangeManageAttendance()

    const handleSaveChangeManageAttendance = async () => {
        if (selectedOldMngAttendance === undefined) {
            ShowToast("Chưa chọn người cũ", "error")
            return
        }

        if (selectedNewMngAttendance === undefined) {
            ShowToast("Chưa chọn người mới", "error")
            return
        }

        await saveChangeManageAttendance.mutateAsync({
            oldUserManageAttendance: selectedOldMngAttendance,
            newUserManageAttendance: selectedNewMngAttendance,
        });

        if (saveChangeManageAttendance.isSuccess) {
            setSelectedOldMngAttendance(undefined)
            setSelectedNewMngAttendance(undefined)

            queryClient.invalidateQueries({ queryKey: ['get-all-assign-attendance-user'] });
        }
    }
    //#endregion

    //#region GET, CHOOSE ATTENDANCE MANAGER
    const { data: attendanceMangers = [] } = useQuery({
        queryKey: ['get-attendance-managers'],
        queryFn: async () => {
            const res = await HrManagementApi.getAttendanceManager()
            return res.data.data.map((u: { userName: string; userCode: string }) => ({
                label: `${u.userName}`,
                value: u.userCode,
            }));
        },
    });

    const [selectedUserManageAttendance, setSelectedUserManageAttendance] = useState<OptionType[]>([]);

    const saveAssignAttendanceManagerToUser = useSaveAssignAttendanceManagerToUser();

    useEffect(() => {
        if (attendanceMangers.length > 0) {
            setSelectedUserManageAttendance(attendanceMangers)
        }
    }, [attendanceMangers])

    const searchUserOptionChooseManageAttendance = async (input: string): Promise<OptionType[]> => {
        const res = await HrManagementApi.getAllAssignAttendanceUser({
            Key: input,
            Page: 1,
            PageSize: 100,
        });

        return res.data.data.map((u: { NVHoTen: string; NVMaNV: string; BPTen: string }) => ({
            label: `${u.NVHoTen} (${u.NVMaNV} - ${u.BPTen})`,
            value: u.NVMaNV,
        }));
    };

    //onchange
    const handleSelectedUserManageAttendance = (selected: OptionType[]) => {
        setSelectedUserManageAttendance(selected)
    };
    
    //save
    const handleSaveUserChooseManageAttendance = async () => {
        if (selectedUserManageAttendance.length <= 0) {
            ShowToast("Vui lòng chọn người quản lý chấm công", "error")
            return
        }

        const data = selectedUserManageAttendance.map(item => ({
            userCode: item.value,
            userName: item.label
        }));

        await saveAssignAttendanceManagerToUser.mutateAsync({
            data: data
        })

        queryClient.invalidateQueries({ queryKey: ['get-attendance-managers'] });
    }
    //#endregion

    //#region GET, CHOOSE USER ATTENDANCE
    const [userCodeSelected, setUserCodeSelected] = useState<string[]>([]);
    const [selectedUserManageAttendanceUser, setSelectedUserManageAttendanceUser] = useState<OptionType[]>([]);
    const didInitCheckboxState = useRef(false);
    const saveTimeKeepingForMultiplePeople = useSaveAttendanceMultiplePeopleToAttendanceManager();

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-department'],
        queryFn: async () => {
            const res = await departmentApi.getAll()
            return res.data.data
        },
    });
    
    const { data: getAllUserFromViClock = [], isPending, isError, error } = useQuery({
        queryKey: ['get-all-assign-attendance-user', debouncedName, selectedDepartment, page, pageSize],
        queryFn: async () => {
            const res = await HrManagementApi.getAllAssignAttendanceUser({
                Key: name,
                DepartmentId: Number(selectedDepartment ?? null),
                Page: page,
                PageSize: pageSize
            })
            setTotalPage(res.data.total_pages)
            return res.data.data
        },
    });

    const handleSearchByName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
        setPage(1)
    }

    function setCurrentPage(page: number): void {
        setPage(page)
    }

    function handlePageSizeChange(size: number): void {
        setPage(1)
        setPageSize(size)
    }

    const handleCheckAll = (checked: boolean) => {
        setToggleShowManageAll(checked)
        if (checked) {
            const newCodes = getAllUserFromViClock.map((u: {NVMaNV: string}) => u.NVMaNV);
            setUserCodeSelected(prev => Array.from(new Set([...prev, ...newCodes])));
        } else {
            const currentPageUserCodes = getAllUserFromViClock.map((u: {NVMaNV: string}) => u.NVMaNV);
            setUserCodeSelected(prev => prev.filter(code => !currentPageUserCodes.includes(code)));
        }
    };

    const allSelectedOnCurrentPage = Array.isArray(getAllUserFromViClock) &&  getAllUserFromViClock?.length > 0 &&
        getAllUserFromViClock.every(u => userCodeSelected.includes(u.NVMaNV));

    const handleOnCheckedChange = async (checked: boolean, userData: {NVMaNV: string, NVHoTen: string, BPTen: string}) => {
        setUserCodeSelected(prev => {
            if (checked) return [...prev, userData.NVMaNV];
            return prev.filter(code => code !== userData.NVMaNV);
        });
        
    };

    useEffect(() => {
        setUserCodeSelected([]);
        didInitCheckboxState.current = false;
    }, [user?.userCode]);

    const handleSelectedUserManageAttendanceUser = (selected: OptionType[]) => {
        setSelectedUserManageAttendanceUser(selected);
    };

    const handleSaveUserManageAttendanceUser = async () => {
        if (userCodeSelected.length <= 0) {
            ShowToast("Chưa chọn người cần chấm công", "error")
            return
        }

        if (selectedUserManageAttendanceUser.length <= 0) {
            ShowToast("Chưa chọn người chấm công", "error")
            return
        }

        const formatSelectedUserManageAttendanceUser = selectedUserManageAttendanceUser.map(item => item.value)
        
        await saveTimeKeepingForMultiplePeople.mutateAsync({
            userCodes: userCodeSelected,
            userCodesManage: formatSelectedUserManageAttendanceUser
        })

        didInitCheckboxState.current = false
        setSelectedUserManageAttendanceUser([])
        setUserCodeSelected([])

        queryClient.invalidateQueries({ queryKey: ['get-all-assign-attendance-user'] });
    }

    const handleRemoveAllUserCodeSelected = () => {
        setUserCodeSelected([])
        didInitCheckboxState.current = false
    }

    //#endregion

    return (
        <div className="p-1 pt-0 space-y-4">
            {/* title */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">HR quản lý</h3>
            </div>

            {/* hr choose training, recruitment, hr manage attendance */}
            <div className="flex flex-col md:flex-row md:items-end mt-5 p-1 sm:p-0 sm:items-start mb-10">
                <div className="flex flex-col md:flex-row md:space-x-4 flex-grow">
                    <div className="w-full md:w-1/3 mb-4 md:mb-0">
                        <Label htmlFor="timekeeping" className="mb-1 block text-gray-700 dark:text-gray-300">Quản lý chấm công</Label>
                        <GenericAsyncMultiSelect
                            value={selectedHRTimekeeping}
                            className="max-w-[400px]"
                            options={ListHr}
                            onChange={(v) => setSelectedHRTimekeeping(v as OptionType[])}
                            placeholder="Chọn người quản lý chấm công"
                        />
                    </div>

                    <div className="w-full md:w-1/3 mb-4 md:mb-0">
                        <Label htmlFor="training" className="mb-1 block text-gray-700 dark:text-gray-300">Đào tạo</Label>
                        <GenericAsyncMultiSelect
                            value={selectedHRTraining}
                            className="max-w-[400px]"
                            options={ListHr}
                            onChange={(v) => setSelectedHRTraining(v as OptionType[])}
                            placeholder="Chọn người đào tạo"
                        />
                    </div>

                    <div className="w-full md:w-1/3 mb-4 md:mb-0">
                        <Label htmlFor="recruitment" className="mb-1 block text-gray-700 dark:text-gray-300">Tuyển dụng</Label>
                        <GenericAsyncMultiSelect
                            value={selectedHRRecruitment}
                            className="max-w-[400px]"
                            options={ListHr}
                            onChange={(v) => setSelectedHRRecruitment(v as OptionType[])}
                            placeholder="Chọn người tuyển dụng"
                        />
                    </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 items-center">
                    <Button disabled={saveHrManagement.isPending} onClick={handleSaveHrManagement} className="hover:cursor-pointer px-10 py-2 bg-blue-600 text-white rounded-[5px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full md:w-auto">
                        {saveHrManagement.isPending ? <Spinner className="text-white" size="small"/> : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Thay đổi người quản lý */}
            <h3 className="font-bold text-base mb-3">Thay đổi người quản lý chấm công</h3>
            <div className="flex flex-col md:flex-row md:items-end p-1 sm:p-0 sm:items-start justify-start mb-8">
                <div className="flex flex-col md:flex-row md:space-x-4 flex-grow items-end">
                    <div className="w-[250px]">
                        <Label htmlFor="timekeeping" className="mb-1 block text-gray-700 dark:text-gray-300">Chọn người cũ</Label>
                        <GenericAsyncMultiSelect
                            mode="single"
                            value={selectedOldMngAttendance}
                            className="w-[250px]"
                            options={attendanceMangers}
                            onChange={(v) => setSelectedOldMngAttendance(v as OptionType[])}
                            placeholder="Chọn"
                        />
                    </div>

                    <div>
                        <ArrowRight />
                    </div>

                    <div className="w-[250px]">
                        <Label htmlFor="training" className="mb-1 block text-gray-700 dark:text-gray-300">Chọn người mới</Label>
                        <GenericAsyncMultiSelect
                            mode="single"
                            value={selectedNewMngAttendance}
                            className="w-[250px]"
                            options={attendanceMangers}
                            onChange={(v) => setSelectedNewMngAttendance(v as OptionType[])}
                            placeholder="Chọn"
                        />
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 items-bottom">
                        <Button disabled={saveChangeManageAttendance.isPending} onClick={handleSaveChangeManageAttendance} className="hover:cursor-pointer px-10 py-2 bg-blue-600 text-white rounded-[5px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full md:w-auto">
                            {saveChangeManageAttendance.isPending ? <Spinner size="small" className="text-white"/> : 'Save'}
                        </Button>
                        {
                            (selectedOldMngAttendance != undefined || selectedNewMngAttendance != null) ? (
                                <span className="text-sm bg-gray-200 py-1 px-3 rounded-[3px] ml-4 hover:cursor-pointer" onClick={() => {
                                    setSelectedOldMngAttendance(undefined)
                                    setSelectedNewMngAttendance(undefined)
                                }}>Hủy</span>
                            ) : (<></>)
                        }
                    </div>
                </div>
            </div>

            {/* choose users manage attendance */}
            <div className="mb-10 p-1 sm:p-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-1">
                    <h3 className="font-bold text-base">Chọn những người quản lý chấm công</h3>
                </div>
                <div className="flex"> 
                    <div className="w-full sm:w-auto mb-3 sm:mb-0"> 
                        <GenericAsyncMultiSelect
                            value={selectedUserManageAttendance}
                            className="min-w-[400px]"
                            fetchOptions={searchUserOptionChooseManageAttendance}
                            onChange={(v) => handleSelectedUserManageAttendance(v as OptionType[])}
                            placeholder="Tìm kiếm mã, tên..."
                        />
                    </div>
                    <Button disabled={saveAssignAttendanceManagerToUser.isPending} onClick={handleSaveUserChooseManageAttendance} className="ml-0 sm:ml-3 hover:cursor-pointer px-10 py-2 bg-blue-600 text-white rounded-[5px] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full sm:w-auto">
                        {saveAssignAttendanceManagerToUser.isPending ? <Spinner className="text-white"/> : 'Save'}
                    </Button>
                </div>
            </div>

            <div className="pb-15">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                    <h3 className="font-bold text-base">Chọn người dùng chấm công</h3>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-start md:justify-start gap-4 dark:bg-gray-800 rounded-lg">
                    <div className="w-full md:w-1/4">
                        <Label htmlFor="search" className="mb-2">Search</Label>
                        <Input
                            id="search"
                            placeholder={t('list_user_page.search')}
                            value={name}
                            onChange={handleSearchByName}
                            className="w-full"
                        />
                    </div>
                    <div className="w-full md:w-1/4">
                        <Label htmlFor="department" className="mb-2">Department</Label>
                        <select
                            value={selectedDepartment}
                            id="department"
                            onChange={(e) => {setSelectedDepartment(e.target.value); setPage(1)}}
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
                        {
                            toggleShowManageAll == true || userCodeSelected.length > 0 ? (
                                <>
                                    <Label htmlFor="Chon nguoi cham cong" className="mb-2">Quản lý chấm công</Label>
                                    <div className="flex items-center">
                                        <GenericAsyncMultiSelect
                                            value={selectedUserManageAttendanceUser}
                                            className="min-w-[500px]"
                                            options={attendanceMangers}
                                            onChange={(v) => handleSelectedUserManageAttendanceUser(v as OptionType[])}
                                            placeholder="Chọn người quản lý"
                                        />
                                        <Button disabled={saveTimeKeepingForMultiplePeople.isPending} className="ml-2 hover:cursor-pointer bg-blue-600 text-white rounded-[5px] hover:bg-blue-700" onClick={handleSaveUserManageAttendanceUser}>
                                            {saveTimeKeepingForMultiplePeople.isPending ? <Spinner className="text-white"/> : 'Lưu'}
                                        </Button>
                                    </div>
                                </>
                            ) : (<></>)
                        }
                    </div>
                </div>
                <div className="mt-5">
                    {
                        <div className="mb-3">
                            <b>Đang chọn:</b> <span className="font-bold text-red-700">{userCodeSelected.length}</span>
                            {
                                userCodeSelected.length > 0 ? (
                                    <span className="ml-5 p-1 bg-gray-200 rounded-[3px] relative pl-5 text-sm hover:cursor-pointer hover:bg-gray-300" onClick={handleRemoveAllUserCodeSelected}>
                                        <X className="absolute left-1 top-2" size={14} />
                                        Bỏ chọn tất cả
                                    </span>
                                ) : (<></>)
                            }
                        </div>
                    }

                    {/* <Table>
                        <TableHeader className="bg-gray-300 hover:bg-gray-300">
                            <TableRow>
                                <TableHead className="w-[50px] text-left z-10">
                                    <Checkbox
                                        className="bg-gray-400 hover:cursor-pointer"
                                        checked={allSelectedOnCurrentPage}
                                        onCheckedChange={(checked) => handleCheckAll(!!checked)}
                                    />
                                </TableHead>
                                <TableHead className="w-[150px] text-left z-10">Mã nhân viên</TableHead>
                                <TableHead className="w-[150px] text-left  z-10">Họ tên</TableHead>
                                <TableHead className="w-[150px] text-left z-10">Bộ phận</TableHead>
                                <TableHead className="w-[250px] text-left  z-10">Người quản lý chấm công</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table> */}
                    <div className="table-responsive" style={{ maxHeight: '650px', overflowX: 'auto' }}>
                        <Table className="min-w-full table-auto">
                            <TableHeader className="bg-gray-300 hover:bg-gray-300">
                            <TableRow>
                                <TableHead className="w-[50px] text-left z-10">
                                    <Checkbox
                                        className="bg-gray-400 hover:cursor-pointer"
                                        checked={allSelectedOnCurrentPage}
                                        onCheckedChange={(checked) => handleCheckAll(!!checked)}
                                    />
                                </TableHead>
                                <TableHead className="w-[150px] text-left z-10">Mã nhân viên</TableHead>
                                <TableHead className="w-[150px] text-left  z-10">Họ tên</TableHead>
                                <TableHead className="w-[150px] text-left z-10">Bộ phận</TableHead>
                                <TableHead className="w-[250px] text-left  z-10">Người quản lý chấm công</TableHead>
                            </TableRow>
                        </TableHeader>
                            <TableBody className="min-w-full table-auto">
                                {isPending ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <TableRow key={index}>
                                            {Array.from({ length: 6 }).map((__, i) => (
                                                <TableCell key={i} data-label="">
                                                    <div className="flex items-center justify-start text-left">
                                                        <Skeleton className="h-3 w-[40px] bg-gray-300" />
                                                    </div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : isError || getAllUserFromViClock.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className={`${isError ? 'text-red-700' : 'text-black'} font-medium text-center`}>
                                            {error?.message ?? 'No results'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    getAllUserFromViClock.map((item: {NVMaNV: string, NVHoTen: string, BPTen: string, UserNamesManageAttendance: string}, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="w-[50px] text-left">
                                                <Checkbox
                                                    className="bg-gray-300 hover:cursor-pointer"
                                                    value={item.NVMaNV}
                                                    checked={userCodeSelected.includes(item.NVMaNV)}
                                                    onCheckedChange={(checked) => handleOnCheckedChange(!!checked, item)}
                                                />
                                            </TableCell>
                                            <TableCell className="w-[150px] text-left">{item?.NVMaNV}</TableCell>
                                            <TableCell className="w-[150px] text-left">{item?.NVHoTen}</TableCell>
                                            <TableCell className="w-[150px] text-left">{item?.BPTen}</TableCell>
                                            <TableCell className="w-[250px] text-left">
                                                {item?.UserNamesManageAttendance ? item?.UserNamesManageAttendance : '---'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {getAllUserFromViClock && getAllUserFromViClock.length > 0 && (
                        <PaginationControl
                            currentPage={page}
                            totalPages={totalPage}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}