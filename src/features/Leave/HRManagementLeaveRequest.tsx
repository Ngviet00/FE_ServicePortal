import TreeCheckbox, { TreeCheckboxLeaveRequest, TreeNode } from "@/components/JsTreeCheckbox/TreeCheckbox";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { ShowToast } from "@/lib";
import leaveRequestApi, { useAttachUserManageOrgUnit, useUpdateUserHavePermissionCreateMultipleLeaveRequest } from "@/api/leaveRequestApi";
import orgUnitApi from "@/api/orgUnitApi";
import userApi from "@/api/userApi";
import { useTranslation } from "react-i18next";

function HRManagementLeaveRequest() {
    const { t } = useTranslation('mngLeaveRequest');
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const updateUserHavePermissionMngLeaveRequest = useUpdateUserHavePermissionCreateMultipleLeaveRequest();

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
                            {attachUserMngOrgUnit.isPending ? <Spinner className="text-white" size="small"/> : "Save"}
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
            </div>
            <div>
                abc
            </div>
        </div>
    );
}

export default HRManagementLeaveRequest;