import { Routes, Route, useLocation  } from 'react-router-dom';
import './App.css'
import DepartmentForm from '@/features/Department/DepartmentForm';
import ListDepartment from '@/features/Department/ListDepartment';
import LeaveRequestForm from '@/features/Leave/LeaveRequestForm';
import ListLeaveRequest from '@/features/Leave/ListLeaveRequest';
import ListPosition from '@/features/Position/ListPosition';
import PositionForm from '@/features/Position/PositionForm';
import ListRole from '@/features/Role/ListRole';
import ListUser from '@/features/User/ListUser';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import MyProfile from '@/pages/MyProfile';
import RegisterPage from '@/pages/RegisterPage';
import RedirectIfAuthenticated from '@/routes/IsAuthenticated';
import PrivateRoute from '@/routes/PrivateRoute';
import CreateUserForm from '@/features/User/CreateUserForm';
import ListTeam from '@/features/Team/ListTeam';
import TeamForm from '@/features/Team/TeamForm';


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
		{ path: "/my-profile", element: <MyProfile /> },
		{ path: "/change-password", element: <ChangePasswordPage /> },
		
		{ path: "/role", element: <ListRole /> },

		{ path: "/department", element: <ListDepartment /> },
		{ path: "/department/create", element: <DepartmentForm /> },
		{ path: "/department/edit/:id", element: <DepartmentForm /> },

		{ path: "/position", element: <ListPosition /> },
		{ path: "/position/create", element: <PositionForm /> },
		{ path: "/position/edit/:id", element: <PositionForm /> },

		{ path: "/team", element: <ListTeam /> },
		{ path: "/team/create", element: <TeamForm /> },
		{ path: "/team/edit/:id", element: <TeamForm /> },

		{ path: "/user", element: <ListUser /> },
		{ path: "/user/create", element: <CreateUserForm /> },

		{ path: "/leave", element: <ListLeaveRequest/> },
		{ path: "/leave/create", element: <LeaveRequestForm/> }
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
