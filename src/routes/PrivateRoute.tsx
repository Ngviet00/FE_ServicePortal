import useHasPermission from "@/hooks/useHasPermission";
import useHasRole from "@/hooks/useHasRole";
import { useAuthStore } from "@/store/authStore";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
	allowedRoles?: string[] | undefined;
	allowedPermissions?: string[] | undefined
	children: JSX.Element;
}

const PrivateRoute = ({ allowedRoles, allowedPermissions, children }: PrivateRouteProps) => {
	const { user } = useAuthStore();
	const hasRole = useHasRole(allowedRoles ?? []);
	const hasPermission = useHasPermission(allowedPermissions ?? [])

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (user && user?.isChangePassword == 0 && location.pathname !== "/change-password") {
        return <Navigate to="/change-password" replace />;
    }

	if (!allowedRoles?.length && !allowedPermissions?.length) {
        return <>{children}</>;
    }

	if (!hasRole && !hasPermission) {
		return <Navigate to="/forbidden" replace />;
	}

	return <>{children}</>;
};

export default PrivateRoute;