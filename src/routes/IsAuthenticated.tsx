// src/routes/RedirectIfAuthenticated.tsx
// import { Navigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export default function RedirectIfAuthenticated({ children }: Props) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return <>{!user && children}</>;
  }