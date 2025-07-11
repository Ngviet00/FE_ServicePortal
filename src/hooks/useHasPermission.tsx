import { useAuthStore } from "@/store/authStore";

const useHasPermission = (allowedPermissions: string[]): boolean => {
	const user = useAuthStore(state => state.user);

	if (user?.roles?.includes("SuperAdmin")) return true;

	const permissions = user?.permissions ?? [];
	return allowedPermissions.some(permission => permissions.includes(permission));
};

export default useHasPermission;