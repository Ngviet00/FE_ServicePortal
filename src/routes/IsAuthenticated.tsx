// src/routes/RedirectIfAuthenticated.tsx
// import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export default function RedirectIfAuthenticated({ children }: Props) {
    // const isLoggedIn = !!localStorage.getItem("token"); // hoặc check theo m đang dùng
  
    // if (isLoggedIn) {
    //   return <Navigate to="/" replace />;
    // }
  
    return <>{children}</>;
  }