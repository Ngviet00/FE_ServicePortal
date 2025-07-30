import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { ShowToast } from "@/lib";
import { useTranslation } from "react-i18next";
import { TreeCheckboxChooseUserChangeOrgUnit } from "@/components/JsTreeCheckbox/TreeCheckboxChooseUserChangeOrgUnit";
import { TreeCheckBoxChooseNewOrgUnit } from "@/components/JsTreeCheckbox/TreeCheckBoxChooseNewOrgUnit";
import orgUnitApi, { useSaveChangeOrgUnitUser } from "@/api/orgUnitApi";
import userApi from "@/api/userApi";

function ChangeOrgUnit() {
    const { t } = useTranslation('changeOrgUnit');

    const { data: getAllDeptOfOrgUnit = [] } = useQuery({
        queryKey: ['get-all-dept-og-org-unit'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDeptOfOrgUnit()
            return res.data.data;
        },
    });

    const [newOrgUnit, setNewOrgUnit] = useState("")
    const handleCheckedChangeNewOrgUnitUser = useCallback((id: string, checked: boolean) => {
        if (!checked) {
            setNewOrgUnit("")
            return
        }
        setNewOrgUnit(id)
    }, [])

    const [selectedUser, setSelectedUser] = useState<string[]>([])

    const handleCheckedChooseUserToChangeOrgUnit = useCallback((id: string, checked: boolean) => {
        setSelectedUser((prevSelectedUser) => {
            const newSelectedUser = new Set(prevSelectedUser);
            if (checked) {
                newSelectedUser.add(id);
            } else {
                newSelectedUser.delete(id);
            }
            return Array.from(newSelectedUser).sort();
        });
    }, [])

    const [keyChooseNewOrgUnit, setKeyChooseNewOrgUnit] = useState(0);
    const [keyChooseUserChangeOrgUnit, setKeyChooseUserChangeOrgUnit] = useState(0);

    const saveChangeOrgUnitUser =  useSaveChangeOrgUnitUser()

    const handleSaveChangeOrgUnitUser = async () => {
        if (newOrgUnit == "") {
            ShowToast("Chưa chọn vị trí cần chuyển", "error")
            return
        }
        
        if (selectedUser.length == 0) {
            ShowToast("Chưa chọn người cần chuyển vị trí", "error")
            return
        }

        await saveChangeOrgUnitUser.mutateAsync({
            UserCodes: selectedUser,
            OrgUnitId: Number(newOrgUnit)
        })

        setNewOrgUnit("")
        setSelectedUser([])

        setKeyChooseNewOrgUnit(prevKey => prevKey + 1);
        setKeyChooseUserChangeOrgUnit(prevKey => prevKey + 1);
    }

    return (
        <div className="p-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">{t('title')}</h3>
            </div>

            <div className="flex mt-5">
                <div className="border p-4 rounded w-[30%]">
                    <TreeCheckboxChooseUserChangeOrgUnit
                        key={keyChooseUserChangeOrgUnit}
                        data={getAllDeptOfOrgUnit}
                        loadChildren={async (node) => {
                            if (node.type == 'jobtitle') {
                                const children = await userApi.GetUserByParentOrgUnit(parseInt(node.id))
                                return children?.data?.data?.map((item: { NVMaNV: { toString: () => never; }; NVHoTen: never; }) => ({
                                    id: item.NVMaNV.toString(),
                                    label: item.NVHoTen,
                                    type: "user"
                                }));
                            } else {
                                const children = await orgUnitApi.GetOrgUnitTeamAndUserNotSetOrgUnitWithDept(Number(node.id))
                                return children?.data?.data?.map((item: { id: { toString: () => never; }; label: never; type: string; }) => ({
                                    id: item.id.toString(),
                                    label: item.label,
                                    type: item.type
                                }));
                            }
                        }}
                        onChange={handleCheckedChooseUserToChangeOrgUnit}
                    />
                </div>

                <div className="border border-l-0 p-4 w-[30%]">
                    <div>
                        <TreeCheckBoxChooseNewOrgUnit
                            key={keyChooseNewOrgUnit}
                            data={getAllDeptOfOrgUnit}
                            loadChildren={async (node) => {
                                const children = await orgUnitApi.GetOrgUnitUserWithDept(parseInt(node.id))
                                const result = children?.data?.data?.map((item: { id: { toString: () => never; }; name: never; }) => ({
                                    id: item.id.toString(),
                                    label: item.name,
                                    type: "org_unit_user"
                                }));
                                return result
                            }}
                            onChange={handleCheckedChangeNewOrgUnitUser}
                        />
                    </div>
                </div>
                <div>
                    <Button className="ml-1 hover:cursor-pointer" onClick={handleSaveChangeOrgUnitUser}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ChangeOrgUnit;