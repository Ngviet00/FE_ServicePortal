import TreeCheckbox, { TreeCheckboxLeaveRequest, TreeNode } from "@/components/JsTreeCheckbox/TreeCheckbox";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { ShowToast } from "@/lib";
import leaveRequestApi, { useAttachUserManageOrgUnit, useUpdateHrWithManagementLeavePermission, useUpdateUserHavePermissionCreateMultipleLeaveRequest } from "@/api/leaveRequestApi";
import orgUnitApi from "@/api/orgUnitApi";
import userApi from "@/api/userApi";
import { useTranslation } from "react-i18next";
import { GenericAsyncMultiSelect, OptionType } from "@/components/ComponentCustom/MultipleSelect";
import delegatedTempApi, { useAddNewDelegatedTemp, useDeleteDelegatedTemp } from "@/api/delegatedTempApi";

function HRManagementLeaveRequest() {
    const { t } = useTranslation('mngLeaveRequest');
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const updateUserHavePermissionMngLeaveRequest = useUpdateUserHavePermissionCreateMultipleLeaveRequest();
    const queryClient = useQueryClient();

    const { data: getAllDeptInOrgUnits = [] } = useQuery({
        queryKey: ['get-all-dept-in-org-unit'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartmentAndFirstOrgUnit()
            return res.data.data;
        },
    });

    useQuery({
        queryKey: ['get-user-have-permission-mng-create-multiple-leave-request'],
        queryFn: async () => {
            const res = await leaveRequestApi.GetUserCodeHavePermissionCreateMultipleLeaveRequest();
            const rs = res.data.data
            setCheckedIds(rs)
            return rs
        },
    });

    const handleCheckedChange = (id: string, isChecked: boolean) => {
        setCheckedIds((prev) => {
            const set = new Set(prev);
            if (isChecked) {
                set.add(id);
            } else {
                set.delete(id);
            }
            return Array.from(set);
        }); 
    };

    const [selectedOpenPositionUser, setSelectedOpenPositionUser] = useState<{ id: string; type: string } | null>(null);

    const [idLocations, setIdLocations] = useState<string[]>([]);

    const handleCheckedChangeLocations = useCallback((nodes: TreeNode[]) => {
        setIdLocations(nodes.map((n) => n.id));
    }, []);

    const handleSave = async () => {
        await updateUserHavePermissionMngLeaveRequest.mutateAsync(checkedIds)
    }

    const handleClickOpenDetailPositionMngLeaveRequest = async (id: string, type: string) => {
        const fetchApi = await leaveRequestApi.GetOrgUnitIdAttachedByUserCode(id)
        const result = fetchApi.data.data
        setIdLocations(result.map(String))
        setSelectedOpenPositionUser({ id: id, type: type });
    }

    const attachUserMngOrgUnit = useAttachUserManageOrgUnit();

    const handleSaveUserMngLeaveRq = async () => {
        if (selectedOpenPositionUser == null) {
            ShowToast("Chưa chọn quản lý", "error")
            return
        }

        const payLoad = {
            userCode: selectedOpenPositionUser.id,
            orgUnitIds: idLocations.map(Number)
        }

        await attachUserMngOrgUnit.mutateAsync(payLoad)
    }

    const [mainUser, setMainUser] = useState<OptionType[]>([]);

    const [delegatedUser, setDelegatedUser] = useState<OptionType[]>([]);

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

    const { data: getAllDelegatedTempLeaveRq = [] } = useQuery({
        queryKey: ['get-all-delegated-temp-leave-rq'],
        queryFn: async () => {
            const res = await delegatedTempApi.GetAll()
            return res.data.data;
        },
    });

    const addDelegatedTemp = useAddNewDelegatedTemp();
    const handleClickSaveDelegatedUser = async() => {
        if (mainUser.length == 0 || delegatedUser.length == 0) {
            ShowToast("Chưa chọn người phụ trách", "error")
            return
        }

        const mainUserCode = mainUser[0].value;
        const delegatedUserCode = delegatedUser[0].value

        await addDelegatedTemp.mutateAsync({
            mainUserCode: mainUserCode,
            tempUserCode: delegatedUserCode
        })
        
        setMainUser([])
        setDelegatedUser([])

        queryClient.invalidateQueries({
            queryKey: ['get-all-delegated-temp-leave-rq'],
        });
    }

    const deleteDelegatedTemp = useDeleteDelegatedTemp();
    const handleRemoveDelegatedTemp = async (mainOrgUnitId: number, tempUserCode: string) => {
        await deleteDelegatedTemp.mutateAsync({
            mainOrgUnitId: mainOrgUnitId,
            tempUserCode: tempUserCode
        });

        queryClient.invalidateQueries({
            queryKey: ['get-all-delegated-temp-leave-rq'],
        });
    }

    const [hrMngLeaveRequest, setHrMngLeaveRequest] = useState<OptionType[]>([]);

    useQuery({
        queryKey: ['get-user-have-permission-hr-mng-leave-request'],
        queryFn: async () => {
            const res = await leaveRequestApi.GetHrWithManagementLeavePermission();
            const rs = res.data.data.map((u: { nvHoTen: string; nvMaNV: string; bpTen: string; }) => ({
                label: `${u.nvHoTen} (${u.nvMaNV} - ${u.bpTen})`,
                value: u.nvMaNV,
            }));
            setHrMngLeaveRequest(rs)
            return rs
        },
    });

    const updateHrMngLeaveRq = useUpdateHrWithManagementLeavePermission();
    const handleSaveHrMngLeaveRequest = async () => {
        const valueArray = hrMngLeaveRequest.map((item: { value: string; }) => item.value);
        await updateHrMngLeaveRq.mutateAsync(valueArray)
    }

    return (
        <div className="p-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">{t('title')}</h3>
            </div>

            <div className="mt-5">
                <span className="font-bold mr-2">
                    {t('choosing')}: <span className="font-bold text-base text-red-700">{selectedOpenPositionUser?.id} {selectedOpenPositionUser?.type}</span>
                </span>
                <Button className="bg-orange-700 hover:cursor-pointer" onClick={() => setSelectedOpenPositionUser(null)}>{t('delete')}</Button>
            </div>

            <div className="flex">
                <div className="border p-4 rounded">
                    <div className="flex mb-3">
                        <Label className="text-red-700 mt-3">{t('title')}</Label>
                        <Button
                            disabled={updateUserHavePermissionMngLeaveRequest.isPending}
                            className="hover:cursor-pointer ml-5 bg-black px-10"
                            onClick={handleSave}
                        >
                            {updateUserHavePermissionMngLeaveRequest.isPending ? <Spinner className="text-white"/> : t('save')}
                        </Button>
                    </div>
                    <TreeCheckboxLeaveRequest
                        onClickOpenDetailPositionMngLeaveRequest={handleClickOpenDetailPositionMngLeaveRequest}
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

                <div className="border border-l-0 p-4">
                    <div className="flex mb-3">
                        <Label className="text-red-700">{t('choose_location_register')}</Label>
                        <Button
                            disabled={attachUserMngOrgUnit.isPending}
                            className="hover:cursor-pointer ml-5 bg-black px-10"
                            onClick={handleSaveUserMngLeaveRq}
                        >
                            {attachUserMngOrgUnit.isPending ? <Spinner className="text-white" size="small"/> : t('save')}
                        </Button>
                    </div>
                    <div>
                        {
                            selectedOpenPositionUser == null ? (
                                <span className="text-sm italic underline text-gray-500 text-center">{t('choose_click')}</span>
                            ) : (
                                <TreeCheckbox
                                    defaultCheckedIds={idLocations}
                                    data={getAllDeptInOrgUnits}
                                    onChange={handleCheckedChangeLocations}
                                />  
                            )
                        }
                    </div>
                </div>
                <div className="border border-l-0 p-4">
                    <Label className="mb-2">{t('hr_mng_leave_request')}</Label>
                    <div className="flex">
                        <GenericAsyncMultiSelect
                            value={hrMngLeaveRequest}
                            className="w-[500px]"
                            fetchOptions={searchUserOptionChooseManageAttendance}
                            onChange={(v) => setHrMngLeaveRequest(v as OptionType[])}
                            placeholder={t('search')}
                        />
                        <Button disabled={updateHrMngLeaveRq.isPending} className="hover:cursor-pointer ml-1" onClick={handleSaveHrMngLeaveRequest}>
                            {updateHrMngLeaveRq.isPending ? <Spinner className="text-white" size="small"/> : t('save')}
                        </Button>
                    </div>
                </div>
            </div>
            <div>
                <span className="text-3xl mb-2 block">{t('assign_permission')}</span>
                <div className="flex items-end">
                    <div>
                        <Label className="mb-2">{t('main_user')}</Label>
                        <GenericAsyncMultiSelect
                            value={mainUser}
                            className="min-w-[500px]"
                            fetchOptions={searchUserOptionChooseManageAttendance}
                            onChange={(v) => setMainUser(v as OptionType[])}
                            placeholder={t('search')}
                        />
                    </div>

                    <div className="ml-3">
                        <Label className="mb-2">{t('temp_user')}</Label>
                        <GenericAsyncMultiSelect
                            value={delegatedUser}
                            className="min-w-[500px]"
                            fetchOptions={searchUserOptionChooseManageAttendance}
                            onChange={(v) => setDelegatedUser(v as OptionType[])}
                            placeholder={t('search')}
                        />
                    </div>
                    <div>
                        <Button className="mt-2 hover:cursor-pointer ml-3" onClick={handleClickSaveDelegatedUser}>{t('save')}</Button>
                    </div>
                </div>
                <div className="list-delegated-temp pb-[7em]">
                    <h3 className="font-bold mt-3 mb-1">{t('list_assign_permission')}</h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>{t('main_user')}</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>{t('temp_user')}</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getAllDelegatedTempLeaveRq.map((item: {orgUnitName: string, mainUser: string, tempUser: string, tempUserCode: string, mainOrgUnitId: number}, index: number) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.orgUnitName} ___ {item.mainUser}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.tempUser} ___ {item.tempUserCode}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        <button
                                        onClick={() => handleRemoveDelegatedTemp(item.mainOrgUnitId, item.tempUserCode)}
                                        style={{ padding: '4px 8px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                        {t('delete')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default HRManagementLeaveRequest;