import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { ShowToast } from "@/lib";
import { useTranslation } from "react-i18next";
import { TreeCheckboxChooseUserChangeOrgUnit } from "@/components/JsTreeCheckbox/TreeCheckboxChooseUserChangeOrgUnit";
import { TreeCheckBoxChooseNewOrgUnit } from "@/components/JsTreeCheckbox/TreeCheckBoxChooseNewOrgUnit";
import orgUnitApi, { useSaveChangeOrgUnitUser } from "@/api/orgUnitApi";
import positionApi from "@/api/positionApi";

function ChangeOrgUnit() {
    const { t } = useTranslation('changeOrgUnit');

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-departments'],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            return res?.data?.data?.map((dept: {id: number, name: string}) => ({
                id: dept.id,
                label: dept.name,
                type: 'department'
            }))
        },
    });

    const [newOrgPositionId, setNewOrgPositionId] = useState("")
    const handleCheckedChangeNewOrgUnitUser = useCallback((id: string, checked: boolean) => {
        if (!checked) {
            setNewOrgPositionId("")
            return
        }
        setNewOrgPositionId(id)
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
        if (newOrgPositionId == "") {
            ShowToast("Chưa chọn vị trí cần chuyển", "error")
            return
        }
        
        if (selectedUser.length == 0) {
            ShowToast("Chưa chọn người cần chuyển vị trí", "error")
            return
        }

        await saveChangeOrgUnitUser.mutateAsync({
            UserCodes: selectedUser,
            ViTriToChucId: Number(newOrgPositionId)
        })

        setNewOrgPositionId("")
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
                        data={departments}
                        loadChildren={async (node) => {
                            if (node.type == 'team') {
                                const children = await orgUnitApi.GetListUserByTeamId(parseInt(node.id))
                                return children.data.data
                            } else {
                                const children = await orgUnitApi.GetTeamByDeptIdAndUserNotSetOrgPositionId(Number(node.id))
                                return children.data.data;
                            }
                        }}
                        onChange={handleCheckedChooseUserToChangeOrgUnit}
                    />
                </div>

                <div className="border border-l-0 p-4 w-[30%]">
                    <div>
                        <TreeCheckBoxChooseNewOrgUnit
                            key={keyChooseNewOrgUnit}
                            data={departments}
                            loadChildren={async (node) => {
                                const children = await positionApi.GetPositionsByDepartmentId(parseInt(node.id))
                                const result = children?.data?.data?.map((item: { id: { toString: () => never; }; name: never; }) => ({
                                    id: item.id.toString(),
                                    label: item.name,
                                    type: "org_position_user"
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