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
import { TreeCheckboxChooseUserChangeOrgUnit } from "@/components/JsTreeCheckbox/TreeCheckboxChooseUserChangeOrgUnit";
import { TreeCheckBoxChooseNewOrgUnit } from "@/components/JsTreeCheckbox/TreeCheckBoxChooseNewOrgUnit";

function ChangeOrgUnit() {
    const { t } = useTranslation('changeOrgUnit');
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

            <div className="flex mt-5">
                <div className="border p-4 rounded w-[30%]">
                    <TreeCheckboxChooseUserChangeOrgUnit
                        onClickOpenDetailPositionMngLeaveRequest={handleClickOpenDetailPositionMngLeaveRequest}
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

                <div className="border border-l-0 p-4 w-[30%]">
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
                        <TreeCheckBoxChooseNewOrgUnit
                            onClickOpenDetailPositionMngLeaveRequest={handleClickOpenDetailPositionMngLeaveRequest}
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
                <div>
                    <Button className="ml-1">Save</Button>
                </div>
            </div>
        </div>
    );
}

export default ChangeOrgUnit;