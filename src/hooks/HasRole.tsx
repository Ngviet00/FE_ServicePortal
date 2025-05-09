import { IRole } from '@/api/roleApi';
import { useAuthStore } from '@/store/authStore';
import { useMemo } from 'react';


const hasAccess = (userRoles: IRole[], allowedRoles: string[]): boolean => {
	const userRoleCodes = userRoles.map(role => role.code?.toLowerCase()).filter(Boolean);
	return (
		allowedRoles.some(code => userRoleCodes.includes(code.toLowerCase())) ||
		userRoleCodes.includes('superadmin')
	);
};

const useHasRole = (allowedRoles: string[]): boolean => {
	const rawRoles = useAuthStore(state => state.user?.roles) as IRole[] | undefined;

	const canAccess = useMemo(() => {
		const roles: IRole[] = rawRoles ?? [];
		return hasAccess(roles, allowedRoles);
	}, [rawRoles, allowedRoles]);

	return canAccess;
};
  
export default useHasRole;