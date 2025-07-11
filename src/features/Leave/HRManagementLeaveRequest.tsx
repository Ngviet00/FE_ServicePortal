import { TreeCheckboxLeaveRequest } from "@/components/JsTreeCheckbox/TreeCheckbox";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import leaveRequestApi, { useUpdateUserHavePermissionCreateMultipleLeaveRequest } from "@/api/leaveRequestApi";
import orgUnitApi from "@/api/orgUnitApi";
import userApi from "@/api/userApi";

function HRManagementLeaveRequest() {
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

    const handleSave = async () => {
        await updateUserHavePermissionMngLeaveRequest.mutateAsync(checkedIds)
    }

    return (
        <div className="p-1 pt-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 sm:mb-0">Chọn người có quyền đăng ký nghỉ phép cho người khác</h3>
            </div>

            <Button
                disabled={updateUserHavePermissionMngLeaveRequest.isPending}
                className="hover:cursor-pointer mt-4 bg-blue-500 hover:bg-blue-700 px-10"
                onClick={handleSave}
            >
                {updateUserHavePermissionMngLeaveRequest.isPending ? <Spinner className="text-white"/> : "Save"}
            </Button>

            <div>
                <TreeCheckboxLeaveRequest
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
    );
}

export default HRManagementLeaveRequest;