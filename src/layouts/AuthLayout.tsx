import { useAuthStore } from "@/store/authStore";
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function AuthLayout({ children }: Props) {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

  	return <div className="auth-page">
    	{!isAuthenticated && children}
    </div>;
}