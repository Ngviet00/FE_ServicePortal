// // src/routes/PrivateRoute.tsx
// // import { Navigate } from "react-router-dom";

// interface Props {
//   children: React.ReactNode;
// }

// export default function PrivateRoute({ children }: Props) {
//   // const isLoggedIn = !!localStorage.getItem("token"); // thay bằng logic của m nếu cần

//   // if (!isLoggedIn) {
//   //   return <Navigate to="/login" replace />;
//   // }

//   return <>{children}</>;
// }

import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const PrivateRoute = ({ children }: Props) => {
  // const isAuthenticated = localStorage.getItem("token"); // thay bằng logic thực tế

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};

export default PrivateRoute;