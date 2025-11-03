import { RoleEnum } from "@/lib";
import { useAuthStore } from "@/store/authStore";

const useHasPermission = (allowedPermissions: string[]): boolean => {
	const user = useAuthStore(state => state.user);

	if (user?.roles?.includes(RoleEnum.SUPERADMIN)) return true;

	const permissions = user?.permissions ?? [];
	return allowedPermissions.some(permission => permissions.includes(permission));
};

export default useHasPermission;