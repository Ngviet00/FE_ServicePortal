import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState } from "react"
import userApi, { useUpdateUserPermission, useUpdateUserRole } from "@/api/userApi"
import roleApi, { IRole } from "@/api/roleApi"
import { useNavigate, useParams } from "react-router-dom"
import permissionApi, { IPermission } from "@/api/permissionApi"

export default function RoleAndPermissionUser () {
    const navigate = useNavigate();
    const { usercode } = useParams<{ usercode: string }>();
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

    const { data: userCurrentRolesAndPermissions, isFetching: isUserRPLoading } = useQuery({
        queryKey: ['user-roles-permissions', usercode],
        queryFn: async () => {
            if (!usercode) return null;
            const res = await userApi.getRoleAndPermissionOfUser(usercode);
            return res.data.data;
        }
    });

    const { data: allRoles = [], isFetching: isAllRolesLoading } = useQuery<IRole[]>({
        queryKey: ['list-roles'],
        queryFn: async () => {
            const res = await roleApi.getAll({ page: 1, pageSize: 200 });
            return res.data.data;
        }
    }); 
    
    const { data: allPermissions = [], isFetching: isAllPermissionsLoading = true } = useQuery<IPermission[]>({
        queryKey: ['list-permissions'],
        queryFn: async () => {
            const res = await permissionApi.getAll({ page: 1, pageSize: 200 });
            return res.data.data;
        }
    });

    useEffect(() => {
        if (userCurrentRolesAndPermissions && !isUserRPLoading) {
            const roles = userCurrentRolesAndPermissions.roles;
            const permissions = userCurrentRolesAndPermissions.permissions;
            setSelectedRoles(roles.map((role: IRole) => role.id.toString()));
            setSelectedPermissions(permissions.map((permission: IPermission) => permission.id.toString()));
        }
    }, [userCurrentRolesAndPermissions, isUserRPLoading]);

    const handleRoleChange = (id: string) => {
        if (selectedRoles.includes(id)) {
            setSelectedRoles(prevSelectedRoles => prevSelectedRoles.filter(roleId => roleId !== id));
        } else {
            setSelectedRoles(prevSelectedRoles => [...prevSelectedRoles, id]);
        }
    };

    const handlePermissionChange = (id: string) => {
        if (selectedPermissions.includes(id)) {
            setSelectedPermissions(prevSelectedPermissions => prevSelectedPermissions.filter(permId => permId !== id));
        } else {
            setSelectedPermissions(prevSelectedPermissions => [...prevSelectedPermissions, id]);
        }
    };

    const updateUserRole = useUpdateUserRole()
    const handleSaveRoles = async () => {
        await updateUserRole.mutateAsync({
            user_code: usercode ?? "",
            role_ids : selectedRoles.map(item => Number(item))
        })
    };

    const updateUserPermission = useUpdateUserPermission()
    const handleSavePermissions = async () => {
        await updateUserPermission.mutateAsync({
            user_code: usercode ?? "",
            permission_ids: selectedPermissions.map(item => Number(item))
        })
    }

    return (
        <div className="p-4 pl-1 pt-0 space-y-4">
            <div className="flex justify-between mb-1">
                <h3 className="font-bold text-2xl m-0 pb-2">Cấu hình vai trò và quyền của người dùng</h3>
                <Button onClick={() => navigate("/user")} className="w-full md:w-auto hover:cursor-pointer">
                    Danh sách người dùng
                </Button>
            </div>

            <div className="mt-2">
                Đang chọn: <strong className="font-bold text-red-700 text-xl">{usercode}</strong>
            </div>

            <div className="max-w-7xl text-gray-800 font-sans">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
                        <h3 className="flex items-center justify-center border-b border-gray-300 pb-2 font-medium text-gray-700">
                            <i className="fas fa-user-tag mr-2"></i> Gán vai trò cho người dùng
                        </h3>
                        <ul className="flex-1 overflow-y-auto max-h-120 list-none p-0 bg-gray-50 rounded-md transition-opacity duration-700 ease-in-out"style={{ opacity: isAllRolesLoading ? 0 : 1 }}>
                            {
                                isAllRolesLoading ? (
                                    <li className="italic text-gray-700 mt-1">Loading...</li>
                                ) : (
                                    allRoles.map((role: IRole) => (
                                        <li
                                            key={role.id}
                                            className="flex items-center p-3 py-0 border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`role_${role.id.toString()}`}
                                                checked={selectedRoles.includes(role.id.toString())}
                                                onChange={() => handleRoleChange(role.id.toString())}
                                                className="transform scale-125 accent-black mr-3"
                                            />
                                            <label
                                                htmlFor={`role_${role.id.toString()}`}
                                                className="h-[50px] leading-[3] flex-1 cursor-pointer text-gray-800 select-none"
                                            >
                                                {role.name}
                                            </label>
                                        </li>
                                        )
                                    )
                                )
                            }
                        </ul>
                        {
                            !isAllRolesLoading ? (
                                <button
                                    disabled={updateUserRole.isPending}
                                    className="mt-4 bg-black hover:opacity-80 hover:cursor-pointer text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-center transition"
                                    onClick={handleSaveRoles}
                                >
                                    <i className="fas fa-save mr-2"></i> {updateUserRole.isPending ? <Spinner className="text-white" size="small"/> : "Lưu"} 
                                </button>
                            ) : (<></>)
                        }
                    </div>

                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
                        <h3 className="flex items-center justify-center border-b border-gray-300 pb-2 font-medium text-gray-700">
                            <i className="fas fa-key mr-2"></i> Gán quyền cho người dùng
                        </h3>
                        <ul className="flex-1 overflow-y-auto max-h-120 list-none p-0 bg-gray-50 rounded-md transition-opacity duration-700 ease-in-out" style={{ opacity: isAllRolesLoading ? 0 : 1 }}>
                            {
                                isAllPermissionsLoading ? (
                                    <li className="italic text-gray-700 mt-1">
                                        Loading...
                                    </li>
                                ) : (
                                    allPermissions.map((perm: IPermission) => (
                                        <li
                                            key={perm.id}
                                            className="flex items-center p-3 py-0 border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`permission_${perm.id.toString()}`}
                                                checked={selectedPermissions.includes(perm.id.toString())}
                                                onChange={() => handlePermissionChange(perm.id.toString())}
                                                className="transform scale-125 accent-black mr-3"
                                            />
                                            <label htmlFor={`permission_${perm.id.toString()}`} className="h-[50px] leading-[3] flex-1 cursor-pointer text-gray-800 select-none">
                                                {perm.name}
                                            </label>
                                        </li>
                                    ))
                                )
                            }
                        </ul>
                        {
                            !isAllPermissionsLoading ? (
                                <button
                                    disabled={updateUserPermission.isPending}
                                    className="mt-4 bg-black hover:opacity-80 hover:cursor-pointer text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-center transition"
                                    onClick={handleSavePermissions}
                                >
                                    <i className="fas fa-save mr-2"></i> {updateUserPermission.isPending ? <Spinner className="text-white" size="small"/> : "Lưu"} 
                                </button>
                            ) : (<></>)
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}