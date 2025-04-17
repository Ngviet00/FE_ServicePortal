import { Routes, Route, useLocation  } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css'

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';

import RedirectIfAuthenticated from "./routes/IsAuthenticated";
import PrivateRoute from "./routes/PrivateRoute";
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ListRole from './features/Role/ListRole';
import ListPosition from './features/Position/List/ListPosition';
import CreatePosition from './features/Position/Create/CreatePosition';
import ListUser from './features/User/List/ListUser';
import CreateUser from './features/User/Create/CreateUser';
import ListDepartment from './features/Department/ListDepartment';
import CreateDepartment from './features/Department/CreateDepartment';

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
		
		{ path: "/role", element: <ListRole /> },

		{ path: "/department", element: <ListDepartment /> },
		{ path: "/department/create", element: <CreateDepartment /> },

		{ path: "/position", element: <ListPosition /> },
		{ path: "/position/create", element: <CreatePosition /> },

		{ path: "/user", element: <ListUser /> },
		{ path: "/user/create", element: <CreateUser /> },
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
