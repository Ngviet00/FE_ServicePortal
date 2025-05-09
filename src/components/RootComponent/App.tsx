import { Routes, Route, useLocation  } from 'react-router-dom';
import './App.css'
import DepartmentForm from '@/features/Department/DepartmentForm';
import ListDepartment from '@/features/Department/ListDepartment';
import LeaveRequestForm from '@/features/Leave/LeaveRequestForm';
import ListLeaveRequest from '@/features/Leave/ListLeaveRequest';
import ListRole from '@/features/Role/ListRole';
import ListUser from '@/features/User/ListUser';
import AuthLayout from '@/layouts/AuthLayout';
import MainLayout from '@/layouts/MainLayout';
import ChangePasswordPage from '@/pages/ChangePasswordPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import RedirectIfAuthenticated from '@/routes/IsAuthenticated';
import PrivateRoute from '@/routes/PrivateRoute';
import CreateUserForm from '@/features/User/CreateUserForm';
import ListLeaveRequestWaitApproval from '@/features/Leave/ListLeaveRequestWaitApproval';
import ListTypeLeave from '@/features/TypeLeave/ListTypeLeave';
import OrgChart from '@/pages/OrgChart';
import Forbidden from '@/pages/Forbidden';

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
		{ path: "/forbidden", element: <Forbidden /> },
		{ path: "/change-password", element: <ChangePasswordPage /> },
		
		{ path: "/role", element: <ListRole />, allowedRoles: ['superadmin']},

		{ path: "/type-leave", element: <ListTypeLeave />, allowedRoles: ['HR', 'HR_Manager'] },

		{ path: "/department", element: <ListDepartment />, allowedRoles: ['HR', 'HR_Manager'] },
		{ path: "/department/create", element: <DepartmentForm />, allowedRoles: ['HR', 'HR_Manager'] },
		{ path: "/department/edit/:id", element: <DepartmentForm />, allowedRoles: ['HR', 'HR_Manager'] },

		{ path: "/user", element: <ListUser />, allowedRoles: ['HR', 'HR_Manager'] },
		{ path: "/user/create", element: <CreateUserForm />, allowedRoles: ['HR', 'HR_Manager'] },
		{ path: "/user/edit/:code", element: <CreateUserForm />, allowedRoles: ['HR', 'HR_Manager'] },
		{ path: "/user/org-chart", element: <OrgChart />, allowedRoles: ['HR', 'HR_Manager'] },

		{ path: "/leave", element: <ListLeaveRequest/> },
		{ path: "/leave/create", element: <LeaveRequestForm/> },
		{ path: "/leave/edit/:id", element: <LeaveRequestForm/> },
		{ path: "/leave/wait-approval", element: <ListLeaveRequestWaitApproval/>}
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
					<MainLayout>
						<Routes>
							{
								privateRoutes.map(({path, element, allowedRoles }) => (
									<Route 
										key={path}
										path={path} 
										element={<PrivateRoute allowedRoles={allowedRoles}>{element}</PrivateRoute>}
									/>
								))
							}
						</Routes>
					</MainLayout>
				)
			}
		</>
	)
}

export default App
