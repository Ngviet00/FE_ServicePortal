import orgUnitApi from "@/api/orgUnitApi";
import timekeepingApi, { useAttachUserManageOrgUnit, useChangeUserMngTimekeeping, useUpdateUserPermissionMngTimeKeeping } from "@/api/timeKeepingApi";
import userApi from "@/api/userApi";
import { GenericAsyncMultiSelect, OptionType } from "@/components/ComponentCustom/MultipleSelect";
import TreeCheckbox, { TreeNode } from "@/components/JsTreeCheckbox/TreeCheckbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { ShowToast } from "@/lib";
import { useQuery } from "@tanstack/react-query";
import { MoveRight, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

function HRManagementTimekeeping() {
    const { t } = useTranslation('mngTimeKeeping');
    const [checkedIds, setCheckedIds] = useState<string[]>([]);

    const userUpdatePermissionTimeKeeping = useUpdateUserPermissionMngTimeKeeping();
    const attachUserMngOrgUnit = useAttachUserManageOrgUnit();

    const [selectedUserMngTKeeping, setSelectedUserMngTKeeping] = useState<OptionType[]>([]);

    const { data: getAllDeptInOrgUnits = [] } = useQuery({
        queryKey: ['get-all-dept-in-org-unit'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartmentAndFirstOrgUnit()
            return res.data.data;
        },
    });

    const handleCheckedChange = useCallback((nodes: TreeNode[]) => {
        setCheckedIds(nodes.map((n) => n.id));
    }, []);

    useQuery({
        queryKey: ['get-user-have-permission-mng-time-keeping'],
        queryFn: async () => {
            const res = await timekeepingApi.GetUserHavePermissionMngTimeKeeping();
            const rs = res.data.data.map((u: { NVHoTen: string; NVMaNV: string; BPTen: string; }) => ({
                label: `${u.NVHoTen} (${u.NVMaNV} - ${u.BPTen})`,
                value: u.NVMaNV,
            }));
            setSelectedUserMngTKeeping(rs)
            return rs
        },
    });

    const searchUserOptionChooseManageAttendance = async (input: string): Promise<OptionType[]> => {
        const res = await userApi.getUserToSelectMngTKeeping({
            keysearch: input,
            Page: 1,
            PageSize: 20,
        });

        return res.data.data.map((u: { NVHoTen: string; NVMaNV: string; BPTen: string }) => ({
            label: `${u.NVHoTen} (${u.NVMaNV} - ${u.BPTen})`,
            value: u.NVMaNV,
        }));
    };

    const [currentSelectedUser, setCurrentSelectedUser] = useState<OptionType[]>([]);

    const handleSaveUserHavePermissionMngTimeKeeping = async () => {
        const valueArray = selectedUserMngTKeeping.map((item: { value: string; }) => item.value);
        await userUpdatePermissionTimeKeeping.mutateAsync(valueArray)
    }

    const handleSaveUserMngTimeKeeping = async() => {
        if (currentSelectedUser.length == 0) {
            ShowToast("Chưa chọn người quản lý", "error")
            return
        }
        const userCode = currentSelectedUser?.value;
        console.log(userCode, checkedIds.map(Number));
        await attachUserMngOrgUnit.mutateAsync(
            {
                userCode: userCode, 
                orgUnitIds: checkedIds.map(Number)
            }
        );
    }

    const handleRemoveCurrentUserSelectedMngTimeKeeping = () => {
        setCheckedIds([]);
        setCurrentSelectedUser([])
    }

    const handleOnChangeCurrentSelectedUser = async (item) => {
        const result = await timekeepingApi.GetOrgUnitIdAttachedByUserCode(item?.value)
        setCurrentSelectedUser(item)

        const ids = result.data.data.map((num: { toString: () => never; }) => num.toString());
        setCheckedIds(ids)
    }

    //#region thay đổi người quản lý chấm công
    const [selectOldUser, setSelectOldUser] = useState<OptionType[]>([]);
    const [selectNewUser, setSelectNewUser] = useState<OptionType[]>([]);

    const changeUserMngTimekeeping = useChangeUserMngTimekeeping()

    const handleCancelChangeUser = () => {
        setSelectOldUser([])
        setSelectNewUser([])
    }

    const handleSaveChangeUser = async () => {
        if (selectOldUser.length == 0) {
            ShowToast("Chọn người cũ", "error")
            return
        }

        if (selectNewUser.length == 0) {
            ShowToast("Chọn người mới", "error")
            return
        }

        if (selectOldUser?.value == selectNewUser?.value) {
            ShowToast("Không thể chọn cùng 1 người", "error")
            return
        }
        const payload = {
            oldUserCode: selectOldUser.value,
            newUserCode: selectNewUser.value,
        }
        await changeUserMngTimekeeping.mutateAsync(payload);
        setCheckedIds([])
        setSelectOldUser([])
        setSelectNewUser([])
        setCurrentSelectedUser([])
    }

    //#endregion

    return (
        <div className="p-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">{t('title')}</h3>
            </div>

            <div className="p-4 pl-0">
                <Label className="mb-2 text-base">{t('choose_user_mng')}</Label>
                <div className="flex items-end">
                    <div className="w-auto mb-3 sm:mb-0"> 
                        <GenericAsyncMultiSelect
                            value={selectedUserMngTKeeping}
                            className="min-w-[500px]"
                            fetchOptions={searchUserOptionChooseManageAttendance}
                            onChange={(v) => setSelectedUserMngTKeeping(v as OptionType[])}
                            placeholder="Tìm kiếm mã, tên..."
                        />
                    </div>
                    <Button disabled={userUpdatePermissionTimeKeeping.isPending} className="ml-5 hover:cursor-pointer" onClick={handleSaveUserHavePermissionMngTimeKeeping}>
                        {userUpdatePermissionTimeKeeping.isPending ? <Spinner className="text-white"/> : t('save')}
                    </Button>
                </div>

                <div>
                    <Label className="mb-2 mt-5 text-base">{t('change_user_mng')}</Label>
                    <div className="flex items-end">
                        <div>
                            <GenericAsyncMultiSelect
                                mode="single"
                                value={selectOldUser}
                                className="w-[400px] pl-1"
                                options={selectedUserMngTKeeping}
                                onChange={(v) => setSelectOldUser(v as OptionType[])}
                                placeholder={t('old_user')}
                            />
                        </div>
                        <MoveRight className="mx-2" />
                        <div>
                            <GenericAsyncMultiSelect
                                mode="single"
                                value={selectNewUser}
                                className="w-[400px] pl-1"
                                options={selectedUserMngTKeeping}
                                onChange={(v) => setSelectNewUser(v as OptionType[])}
                                placeholder={t('new_user')}
                            />
                        </div>
                       <Label className="ml-2 underline text-red-700 underline-offset-2 pr-2 hover:cursor-pointer"onClick={handleCancelChangeUser}>
                            <X/>
                        </Label>
                        <Button 
                            className="hover:cursor-pointer bg-red-800"
                            onClick={handleSaveChangeUser}
                        >
                            {t('save')}
                        </Button>   
                    </div>
                </div>

                <Label className="mt-5 mb-3 text-base">{t('choose_user_and_location')}</Label>
                <div className="flex">
                    <div className="border" style={{flexBasis: '25%'}}>
                        <Label htmlFor="timekeeping" className="mb-1 block text-red-700 dark:text-gray-300 p-2 pl-1">{t('choose_user')}</Label>
                        <div className="flex">
                            <GenericAsyncMultiSelect
                                mode="single"
                                value={currentSelectedUser}
                                className="w-[300px] pl-1"
                                options={selectedUserMngTKeeping}
                                onChange={(v) => handleOnChangeCurrentSelectedUser(v as OptionType[])}
                                placeholder={t('choose')}
                            />
                            {
                                currentSelectedUser.length == 0 ? (
                                    <></>
                                ) : (<Label className="ml-2 underline text-red-700 underline-offset-2 pr-2 hover:cursor-pointer" onClick={handleRemoveCurrentUserSelectedMngTimeKeeping}><X/></Label>)
                            }
                        </div>

                    </div>
                    <div className="border" style={{flexBasis: '35%'}}>
                        <Label className="mb-1 block text-red-700 dark:text-gray-300 p-2 pl-1">
                            {t('choose_location')}
                        </Label>
                        <div className="pl-2">
                            <TreeCheckbox
                                defaultCheckedIds={checkedIds}
                                data={getAllDeptInOrgUnits}
                                loadChildren={async (node) => {
                                    const children = await userApi.GetUserByParentOrgUnit(parseInt(node.id))
                                    return children?.data?.data?.map((item: { NVMaNV: { toString: () => never; }; NVHoTen: never; }) => ({
                                        id: item.NVMaNV.toString(),
                                        label: item.NVHoTen,
                                        type: "user"
                                    }));
                                }}
                                onChange={handleCheckedChange}
                            />
                        </div>
                    </div>
                    <div className="border" style={{flexBasis: '10%'}}>
                        <Label className="mb-1 block text-red-700 dark:text-gray-300 p-2 pl-1">
                            {t('action')}
                        </Label>
                        <Button disabled={attachUserMngOrgUnit.isPending} onClick={handleSaveUserMngTimeKeeping} className="ml-1 bg-blue-700 hover:bg-blue-800 hover:cursor-pointer">
                            {attachUserMngOrgUnit.isPending ? <Spinner className="text-white"/> : t('save')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HRManagementTimekeeping;