import useHasRole from "@/hooks/HasRole";
import { useAuthStore } from "@/store/authStore";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
	allowedRoles: string[] | undefined;
	children: JSX.Element;
}

const PrivateRoute = ({ allowedRoles, children }: PrivateRouteProps) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const hasRole = useHasRole(allowedRoles ?? []);
	const isChangePassword = useAuthStore((state) => state.user?.isChangePassword)

	if ( isAuthenticated && Number(isChangePassword) === 0 && location.pathname !== "/change-password") {
		return <Navigate to="/change-password" replace />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (!hasRole && allowedRoles && allowedRoles.length > 0) {
		return <Navigate to="/forbidden" replace />;
	}

	return <>{children}</>;
};

export default PrivateRoute;