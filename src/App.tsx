import { Routes, Route, useLocation  } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserList from './pages/UserList';
import UserCreate from './pages/UserCreate';
import UserEdit from './pages/UserEdit';
import './App.css'

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';


import RedirectIfAuthenticated from "./routes/IsAuthenticated";
import PrivateRoute from "./routes/PrivateRoute";
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

function App() {

	const location = useLocation();
	
	const authRoutes = ["/login", "/register"];
	const isAuthRoute = authRoutes.includes(location.pathname);

	const publicRoutes = [
		{ path: "/login", element: <LoginPage /> },
		{ path: "/register", element: <RegisterPage /> },
	];

	const privateRoutes = [
		{ path: "/", element: <HomePage /> },
		{ path: "/change-password", element: <ChangePasswordPage /> },
		{ path: "/user/create", element: <UserCreate /> },
		{ path: "/user/edit", element: <UserEdit /> },
		{ path: "/user/list", element: <UserList /> },
		{ path: "/category/create", element: <UserCreate /> },
		{ path: "/category/edit", element: <UserCreate /> },
		{ path: "/category/list", element: <UserCreate /> },
	];
  
	return (
		<>
			{
				isAuthRoute 
				?
				(
					<AuthLayout>
						<Routes>
							{
								publicRoutes.map(({ path, element }) => (
									<Route
										key={path}
										path={path}
										element={<RedirectIfAuthenticated>{element}</RedirectIfAuthenticated>}
									/>
								))
							}
						</Routes>
					</AuthLayout>
				) 
				:
				(
					<PrivateRoute>
						<MainLayout>
							<Routes>
								{
									privateRoutes.map(({path, element}) => (
										<Route 
											key={path}
											path={path} 
											element={element}
										/>
									))
								}
							</Routes>
						</MainLayout>
					</PrivateRoute>
				)
			}
		</>
	)
}

export default App
