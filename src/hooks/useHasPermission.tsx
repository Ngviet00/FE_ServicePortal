import { useAuthStore } from "@/store/authStore";

const useHasPermission = (allowedPermissions: string[]): boolean => {
    const permissions = useAuthStore(state => state.user?.permissions ?? []);

    return allowedPermissions.some(permission => permissions.includes(permission));
};

export default useHasPermission