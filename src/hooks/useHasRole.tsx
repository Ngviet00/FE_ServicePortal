import { RoleEnum } from '@/lib';
import { useAuthStore } from '@/store/authStore';

const useHasRole = (allowedRoles: string[]): boolean => {
	const roles = useAuthStore(state => state.user?.roles);

	if (!roles || roles.length == 0) {
		return false
	}

	if (roles.includes(RoleEnum.SUPERADMIN)) {
		return true;
	}

	return allowedRoles.some(role => roles.includes(role));
};

export default useHasRole