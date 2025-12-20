/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { ShowToast, UnitEnum } from "@/lib";
import { useTranslation } from "react-i18next";
import { TreeCheckboxChooseUserChangeOrgUnit } from "@/components/JsTreeCheckbox/TreeCheckboxChooseUserChangeOrgUnit";
import orgUnitApi from "@/api/orgUnitApi";
import { useAuthStore } from "@/store/authStore";
import sapApi, { useUpdateUserHaveRoleSAP } from "@/api/sapApi";
import { Spinner } from "@/components/ui/spinner";

function ConfigUserAssignSAP() {
    const lang = useTranslation().i18n.language.split('-')[0]
    const user = useAuthStore(u => u.user);

    const { data: departments = [] } = useQuery({
        queryKey: ['get-all-departments', user?.userCode],
        queryFn: async () => {
            const res = await orgUnitApi.GetAllDepartment()
            const results = res?.data?.data;
            let finalResult = [];

            if (user?.orgPositionId == 7) {
                finalResult = results?.filter((e: {id: number}) => e.id == 7 || e.id == 10 || e.id == 39)
            }
            else if (user?.unitId == UnitEnum.GM) {
                finalResult = results?.filter((e: {id: number}) => e.id == user?.departmentId || e.id == 38)
            }
            else {
                finalResult = results?.filter((e: {id: number}) => e.id == user?.departmentId)
            }

            return finalResult?.map((dept: {id: number, name: string}) => ({
                id: dept.id,
                label: dept.name,
                type: 'department'
            }))
        },
        enabled: user?.unitId == UnitEnum.GM || user?.unitId == UnitEnum.Manager
    });

    const [selectedUser, setSelectedUser] = useState<string[]>([])

    const handleCheckedChooseUserHaveRoleSAP = useCallback((id: string, checked: boolean) => {
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

    const updateUserHaveRoleSAP =  useUpdateUserHaveRoleSAP()
    const handleSaveChangeUpdateUserRoleSAP = async () => {
        if (selectedUser.length == 0) {
            ShowToast(lang == 'vi' ? 'Chưa chọn người dùng SAP' : 'Please select user', "error")
            return
        }

        await updateUserHaveRoleSAP.mutateAsync(selectedUser)
    }

    return (
        <div className="p-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">
                    {
                        departments?.length <= 0 ? (lang == 'vi' ? 'Không có dữ liệu': 'Not found data') : 'Quản lý phân bổ người dùng SAP'
                    }
                </h3>
            </div>
            {
                departments.length > 0 && (
                    <div className="flex mt-5">
                        <div className="border p-4 rounded w-[30%]">
                            <TreeCheckboxChooseUserChangeOrgUnit
                                data={departments}
                                loadChildren={async (node) => {
                                    const children = await sapApi.getListStaffByDepartmentId(parseInt(node.id))
                                    const results = children.data.data;
                                    const usersWithSapRole = results.filter((element: any) => element.metaData && element.metaData.hasRoleSAP == 1).map((element: any) => element.id);

                                    setSelectedUser(prevSelectedUser => {
                                        const newSelectedUserSet = new Set(prevSelectedUser);
                                        usersWithSapRole.forEach((userCode: string) => {
                                            newSelectedUserSet.add(userCode);
                                        });
                                        return Array.from(newSelectedUserSet).sort();
                                    });

                                    return results;
                                }}
                                onChange={handleCheckedChooseUserHaveRoleSAP}
                            />
                        </div>
                        <div>
                            <Button disabled={updateUserHaveRoleSAP.isPending} className="ml-1 hover:cursor-pointer" onClick={handleSaveChangeUpdateUserRoleSAP}>
                                {updateUserHaveRoleSAP.isPending ? <Spinner/> : lang == 'vi' ? 'Lưu' : 'Save'}
                            </Button>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default ConfigUserAssignSAP;