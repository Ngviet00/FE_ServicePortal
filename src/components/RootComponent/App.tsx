import { Routes, Route, useLocation  } from 'react-router-dom';
import { RoleEnum } from '@/lib';
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
import ListLeaveRequestWaitApproval from '@/features/Leave/ListLeaveRequestWaitApproval';
import ListTypeLeave from '@/features/TypeLeave/ListTypeLeave';
import OrgChart from '@/pages/OrgChart';
import Timekeeping from '@/features/TimeKeeping/Timekeeping';
import Forbidden from '@/pages/Forbidden';
import MngTimekeeping from '@/features/TimeKeeping/MngTimeKeeping';
import MemoNotification from '@/features/MemoNotification/MemoNotification';
import CreateMemoNotification from '@/features/MemoNotification/CreateMemoNotification';
import DetailMemoNotification from '@/pages/DetailMemoNotification';
import HistoryListApproval from '@/features/Leave/HistoryListApproval';
import AdminSetting from '@/pages/AdminSetting';
import HRManagementTimekeeping from '@/features/TimeKeeping/HRManagementTimekeeping';
import LeaveRequestFormForOthers from '@/features/Leave/LeaveRequestFormForOthers';
import PersonalInfo from '@/pages/PersonalInfo';
import './App.css'
import HRManagementLeaveRequest from '@/features/Leave/HRManagementLeaveRequest';

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
		{ path: "/role", element: <ListRole />, allowedRoles: [RoleEnum.SUPERADMIN]},
		{ path: "/type-leave", element: <ListTypeLeave />, allowedRoles: [RoleEnum.HR] },
		
		{ path: "/user", element: <ListUser />, allowedRoles: [RoleEnum.HR] },
		{ path: "/user/org-chart", element: <OrgChart />, allowedRoles: [RoleEnum.HR] },
		
		{ path: "/leave", element: <ListLeaveRequest/> },
		{ path: "/leave/create", element: <LeaveRequestForm/> },
		{ path: "/leave/create-leave-for-others", element: <LeaveRequestFormForOthers/>},
		{ path: "/leave/edit/:id", element: <LeaveRequestForm/> },
		{ path: "/leave/history-approved", element: <HistoryListApproval/>},

		{ path: "/leave/wait-approval", element: <ListLeaveRequestWaitApproval/>},
		{ path: "/time-keeping", element: <Timekeeping/>},
		{ path: "/management-time-keeping", element: <MngTimekeeping/>, allowedPermissions: ['time_keeping.mng_time_keeping']},

		{ path: "/memo-notify", element: <MemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION] },
		{ path: "/memo-notify/create", element: <CreateMemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION] },
		{ path: "/memo-notify/edit/:id", element: <CreateMemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION] },

		{ path: "/detail-memo-notify/:id", element: <DetailMemoNotification/> },
		{ path: "/admin-setting", element: <AdminSetting />, allowedRoles: [RoleEnum.SUPERADMIN] },
		{ path: "/hr-mng-timekeeping", element: <HRManagementTimekeeping />, allowedRoles: [RoleEnum.HR] },
		{ path: "/hr-mng-leave-request", element: <HRManagementLeaveRequest />, allowedRoles: [RoleEnum.HR] },
		{ path: "/personal-info", element: <PersonalInfo />},
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
								privateRoutes.map(({path, element, allowedRoles, allowedPermissions }) => (
									<Route 
										key={path}
										path={path} 
										element={
											<PrivateRoute 
												allowedPermissions={allowedPermissions} 
												allowedRoles={allowedRoles}
											>
												{element}
											</PrivateRoute>
										}
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
