import { Routes, Route, useLocation  } from 'react-router-dom';
import { RoleEnum } from '@/lib';
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
import ListTypeLeave from '@/features/TypeLeave/ListTypeLeave';
import OrgChart from '@/pages/OrgChart';
import Timekeeping from '@/features/TimeKeeping/Timekeeping';
import Forbidden from '@/pages/Forbidden';
import MngTimekeeping from '@/features/TimeKeeping/MngTimeKeeping';
import MemoNotification from '@/features/MemoNotification/MemoNotification';
import CreateMemoNotification from '@/features/MemoNotification/CreateMemoNotification';
import AdminSetting from '@/pages/AdminSetting';
import HRManagementTimekeeping from '@/features/TimeKeeping/HRManagementTimekeeping';
import LeaveRequestFormForOthers from '@/features/Leave/LeaveRequestFormForOthers';
import PersonalInfo from '@/pages/PersonalInfo';
import './App.css'
import HRManagementLeaveRequest from '@/features/Leave/HRManagementLeaveRequest';
import RoleAndPermissionUser from '@/features/User/RoleAndPermissionUser';
import DetailMemoNotificationWaitApproval from '@/features/MemoNotification/DetailWaitApprovalMemoNotification';
import ChangeOrgUnit from '@/features/OrgUnit/ChangeOrgUnit';
import StatisticalFormIT from '@/features/FormIT/StatisticalFormIT';
import CreateFormIT from '@/features/FormIT/CreateFormIT';
import ListFormIT from '@/features/FormIT/ListFormIT';
import PendingApproval from '@/features/Approval/PendingApproval';
import AssignedTasks from '@/features/Approval/AssignedTasks';
import ApprovalHistory from '@/features/Approval/ApprovalHistory';
import ListPermission from '@/features/Permission/ListPermission';
import ListRequestType from '@/features/RequestType/ListRequestType';
import ApprovalFlow from '@/pages/ApprovalFlow';
import SettingOrgUnit from '@/features/OrgUnit/SettingOrgUnit';
import ViewOnlyMemoNotification from '@/features/MemoNotification/ViewOnlyMemoNotification';
import DetailWaitApprovalLeaveRq from '@/features/Leave/DetailWaitApprovalLeaveRq';
import ViewOnlyLeaveRq from '@/features/Leave/ViewOnlyLeaveRq';
import ListPriority from '@/features/Priority/ListPriority';
import ListITCategory from '@/features/ITCategory/ListITCategory';
import DetailWaitApprovalFormIT from '@/features/FormIT/DetailWaitApprovalFormIT';
import ViewOnlyFormIT from '@/features/FormIT/ViewOnlyFormIT';
import AssignedFormIT from '@/features/FormIT/AssignedFormIT';
import StatisticalFormPurchase from '@/features/Purchasing/StatisticalFormPurchase';
import CreateFormPurchase from '@/features/Purchasing/CreateFormPurchase';
import ListFormPurchase from '@/features/Purchasing/ListFormPurchase';
import AllFormPurchase from '@/features/Purchasing/AllFormPurchase';
import DetailWaitApprovalFormPurchase from '@/features/Purchasing/DetailWaitApprovalFormPurchase';
import AssignedFormPurchase from '@/features/Purchasing/AssignedFormPurchase';
import ViewOnlyFormPurchase from '@/features/Purchasing/ViewOnlyFormPurchase';
import StatisticalLeaveRqForm from '@/features/Leave/StatisticalLeaveRqForm';
import AllFormLeaveRequest from '@/features/Leave/AllFormLeaveRequest';
import ListLeaveRequestRegistered from '@/features/Leave/ListLeaveRequestRegistered';
import CreateOverTime from '@/features/Overtime/CreateOverTime';
import ListMyOverTime from '@/features/Overtime/ListMyOverTime';
import ListOverTimeRegister from '@/features/Overtime/ListOverTimeRegister';
import ViewOverTime from '@/features/Overtime/ViewOverTime';
import DetailApprovalOverTime from '@/features/Overtime/DetailApprovalOverTime';
import ListMyMissTimeKeeping from '@/features/MissTimeKeeping/ListMyMissTimeKeeping';
import ViewMissTimeKeeping from '@/features/MissTimeKeeping/ViewMissTimeKeeping';
import ListMissTimeKeepingRegister from '@/features/MissTimeKeeping/ListMissTimeKeepingRegister';
import CreateMissTimeKeeping from '@/features/MissTimeKeeping/CreateMissTimeKeeping';
import DetailApprovalMissTimeKeeping from '@/features/MissTimeKeeping/DetailApprovalMissTimeKeeping';
import ListInternalMemoHR from '@/features/InternalMemoHR/ListInternalMemoHR';
import CreateInternalMemoHR from '@/features/InternalMemoHR/CreateInternalMemoHR';
import ViewAndApprovalInternalMemoHR from '@/features/InternalMemoHR/ViewAndApprovalInternalMemoHR';
import WaitConfirm from '@/features/Approval/WaitConfirm';
import WaitQuote from '@/features/Approval/WaitQuote';
import ListItemWaitQuote from '@/features/Purchasing/ListItemWaitQuote';
import ListITFormWaitFormPurchase from '@/features/FormIT/ListITFormWaitFormPurchase';

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
		{ path: "/personal-info", element: <PersonalInfo />},

		//superadmin
		{ path: "/role", element: <ListRole />, allowedRoles: [RoleEnum.SUPERADMIN]},
		{ path: "/permission", element: <ListPermission />, allowedRoles: [RoleEnum.SUPERADMIN]},
		{ path: "/request-type", element: <ListRequestType />, allowedRoles: [RoleEnum.SUPERADMIN] },
		{ path: "/approval-flow", element: <ApprovalFlow />, allowedRoles: [RoleEnum.SUPERADMIN] },
		{ path: "/setting-org-unit", element: <SettingOrgUnit />, allowedRoles: [RoleEnum.SUPERADMIN] },
		{ path: "/priority", element: <ListPriority />, allowedRoles: [RoleEnum.SUPERADMIN] },
		{ path: "/it-category", element: <ListITCategory />, allowedRoles: [RoleEnum.SUPERADMIN] },
		{ path: "/admin-setting", element: <AdminSetting />, allowedRoles: [RoleEnum.SUPERADMIN] },

		//hr
		{ path: "/type-leave", element: <ListTypeLeave />, allowedRoles: [RoleEnum.HR] },
		{ path: "/user", element: <ListUser />, allowedRoles: [RoleEnum.HR] },
		{ path: "/user/role-and-permission/:usercode", element: <RoleAndPermissionUser />, allowedRoles: [RoleEnum.SUPERADMIN] },
		{ path: "/user/org-chart", element: <OrgChart />, allowedRoles: [RoleEnum.HR] },
		{ path: "/hr-mng-timekeeping", element: <HRManagementTimekeeping />, allowedRoles: [RoleEnum.HR] },
		{ path: "/hr-mng-leave-request", element: <HRManagementLeaveRequest />, allowedRoles: [RoleEnum.HR] },
		{ path: "/change-org-unit", element: <ChangeOrgUnit />, allowedRoles: [RoleEnum.HR] },

		//memo notification
		{ path: "/memo-notify", element: <MemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION, RoleEnum.IT], allowedPermissions: ['memo_notification.create'] },
		{ path: "/memo-notify/create", element: <CreateMemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION, RoleEnum.IT], allowedPermissions: ['memo_notification.create'] }, 
		{ path: "/memo-notify/edit/:id", element: <CreateMemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION, RoleEnum.IT], allowedPermissions: ['memo_notification.create'] },
		{ path: "/view-memo-notify-approval/:id", element: <DetailMemoNotificationWaitApproval />, allowedRoles: [RoleEnum.HR, RoleEnum.UNION, RoleEnum.IT], allowedPermissions: ['memo_notification.create'] },
		{ path: "/view/memo-notify/:id", element: <ViewOnlyMemoNotification />},
		
		//leave + timekeeping
		{ path: "/leave", element: <ListLeaveRequest/> },
		{ path: "/leave/create", element: <LeaveRequestFormForOthers/> },
		{ path: "/leave/edit/:id", element: <LeaveRequestFormForOthers/> },
		{ path: "/leave/leave-registered", element: <ListLeaveRequestRegistered/> },
		{ path: "/leave/view/:id", element: <ViewOnlyLeaveRq/> },
		{ path: "/view-leave-request-approval/:id", element: <DetailWaitApprovalLeaveRq />},
		{ path: "/view/leave-request/:id", element: <ViewOnlyLeaveRq />},

		//overtime
		{ path: "/overtime", element: <ListMyOverTime/> },
		{ path: "/overtime/overtime-registered", element: <ListOverTimeRegister/> },
		{ path: "/overtime/create", element: <CreateOverTime/> },
		{ path: "/overtime/edit/:id", element: <CreateOverTime/> },
		{ path: "/view/overtime/:id", element: <ViewOverTime/> },
		{ path: "/view-overtime-approval/:id", element: <DetailApprovalOverTime />},

		//miss timekeeping
		{ path: "/miss-timekeeping", element: <ListMyMissTimeKeeping/> },
		{ path: "/miss-timekeeping/create", element: <CreateMissTimeKeeping/> },
		{ path: "/miss-timekeeping/edit/:id", element: <CreateMissTimeKeeping/> },
		{ path: "/miss-timekeeping/registered", element: <ListMissTimeKeepingRegister/> },
		{ path: "/view/miss-timekeeping/:id", element: <ViewMissTimeKeeping/> },
		{ path: "/view-miss-timekeeping-approval/:id", element: <DetailApprovalMissTimeKeeping />},

		//internal hr
		{ path: "/internal-memo-hr", element: <ListInternalMemoHR/> },
		{ path: "/internal-memo-hr/create", element: <CreateInternalMemoHR/> },
		{ path: "/internal-memo-hr/edit/:id", element: <CreateInternalMemoHR/> },
		{ path: "/internal-memo-hr/:id", element: <ViewAndApprovalInternalMemoHR/> },

		{ path: "/time-keeping", element: <Timekeeping/>},
		{ path: "/management-time-keeping", element: <MngTimekeeping/>}, //, allowedPermissions: ['time_keeping.mng_time_keeping']

		{ path: "/leave/statistical", element: <StatisticalLeaveRqForm />},
		{ path: "/leave/all-form-leave-request", element: <AllFormLeaveRequest />},

		//form it
		{ path: "/form-it/statistical", element: <StatisticalFormIT />, allowedRoles: [RoleEnum.IT]},
		{ path: "/form-it/all-form-it", element: <ListFormIT />, allowedRoles: [RoleEnum.IT]},
		{ path: "/form-it/create", element: <CreateFormIT />},
		{ path: "/form-it", element: <ListFormIT />},
		{ path: "/form-it/edit/:id", element: <CreateFormIT />},
		{ path: "/view-form-it-approval/:id", element: <DetailWaitApprovalFormIT />},
		{ path: "/approval/assigned-form-it/:id", element: <AssignedFormIT />},
		{ path: "/view/form-it/:id", element: <ViewOnlyFormIT />},
		{ path: "/form-it/list-item-wait-form-purchase", element: <ListITFormWaitFormPurchase />},

		//purchasing
		{ path: "/purchase/statistical", element: <StatisticalFormPurchase />, }, //allowedRoles: [RoleEnum.PURCHASING]
		{ path: "/purchase/create", element: <CreateFormPurchase />},
		{ path: "/purchase", element: <ListFormPurchase />},
		{ path: "/purchase/edit/:id", element: <CreateFormPurchase />},
		{ path: "/view/purchase/:id", element: <ViewOnlyFormPurchase />},
		{ path: "/view-purchase-approval/:id", element: <DetailWaitApprovalFormPurchase />},
		{ path: "/purchase/all-form-purchase", element: <AllFormPurchase />, }, //allowedRoles: [RoleEnum.PURCHASING]
		{ path: "/approval/assigned-purchase/:id", element: <AssignedFormPurchase />},
		{ path: "/purchase/list-item-wait-quote", element: <ListItemWaitQuote />},

		//approval
		{ path: "/approval/pending-approval", element: <PendingApproval />},
		{ path: "/approval/assigned-tasks", element: <AssignedTasks />},
		{ path: "/approval/approval-history", element: <ApprovalHistory />},
		{ path: "/approval/wait-confirm", element: <WaitConfirm />},
		{ path: "/approval/wait-quote", element: <WaitQuote />}
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
