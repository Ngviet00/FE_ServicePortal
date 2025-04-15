import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";

type Props = {
    children: React.ReactNode;
};

const PrivateRoute = ({ children }: Props) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

export default PrivateRoute;