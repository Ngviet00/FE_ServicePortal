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
import ListPriority from '@/features/Priority/ListPriority';
import ListITCategory from '@/features/ITCategory/ListITCategory';
import StatisticalFormPurchase from '@/features/Purchasing/StatisticalFormPurchase';
import CreateFormPurchase from '@/features/Purchasing/CreateFormPurchase';
import ListFormPurchase from '@/features/Purchasing/ListFormPurchase';
import AllFormPurchase from '@/features/Purchasing/AllFormPurchase';
import ListLeaveRequestRegistered from '@/features/Leave/ListLeaveRequestRegistered';
import CreateOverTime from '@/features/Overtime/CreateOverTime';
import ListMyOverTime from '@/features/Overtime/ListMyOverTime';
import ListOverTimeRegister from '@/features/Overtime/ListOverTimeRegister';
import ListInternalMemoHR from '@/features/InternalMemoHR/ListInternalMemoHR';
import CreateInternalMemoHR from '@/features/InternalMemoHR/CreateInternalMemoHR';
import WaitConfirm from '@/features/Approval/WaitConfirm';
import WaitQuote from '@/features/Approval/WaitQuote';
import ListItemWaitQuote from '@/features/Purchasing/ListItemWaitQuote';
import ListITFormWaitFormPurchase from '@/features/FormIT/ListITFormWaitFormPurchase';
import { CreateVote } from '@/features/Vote/CreateVote';
import ListVote from '@/features/Vote/ListVote';
import DetailVote from '@/features/Vote/DetailVote';
import ListTimeKeeping from '@/features/TimeKeeping/ListTimeKeeping';
import { SAPComponent } from '@/features/Sap/SAPComponent';
import ConfigUserAssignSAP from '@/features/Sap/ConfigUserAssignSAP';
import ListSAPRegistered from '@/features/Sap/ListSAPRegistered';
import CreateSAP from '@/features/Sap/CreateSAP';
import ListFAQ from '@/features/FAQ/ListFAQ';
import MngFAQ from '@/features/FAQ/MngFAQ';
import { CreateFAQ } from '@/features/FAQ/CreateFAQ';
import ConfigOrgPositionRole from '@/features/Role/ConfigOrgPositionRole';
import MngMemberUnion from '@/features/Union/MngMemberUnion/MngMemberUnion';
import CreateWarningLetter from '@/features/HR/WarningLetter/CreateWarningLetter';
import ListWarningLetter from '@/features/HR/WarningLetter/ListWarningLetter';
import DetailApproval from '@/features/Approval/DetailApproval';
import ViewDetail from '@/features/Approval/ViewDetail';
import CreateTermination from '@/features/HR/TerminationLetter/CreateTermination';
import ListTermination from '@/features/HR/TerminationLetter/ListTermination';
import ListRegnation from '@/features/HR/ResignationLetter/ListRegnation';
import CreateResignation from '@/features/HR/ResignationLetter/CreateResignation';
import ListAbsentOverDay from '@/features/HR/TerminationLetter/ListAbsentOverDay';
import CreateRequisition from '@/features/HR/RequisitionLetter/CreateRequisition';
import ListRequisition from '@/features/HR/RequisitionLetter/ListRequisition';
import StatisticalLeaveRqForm from '@/features/Leave/StatisticalLeaveRqForm';
import CreateFeedback from '@/features/Feedback/CreateFeedback';
import ListMyFeedback from '@/features/Feedback/ListMyFeedback';
import PendingResponse from '@/features/Feedback/PendingResponse';
import ViewFeedback from '@/features/Feedback/ViewFeedback';
import AllFeedback from '@/features/Feedback/GetAllFeedback';
import CreateUser from '@/features/User/CreateUser';

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
		{ path: "/config-org-position-role", element: <ConfigOrgPositionRole />, allowedRoles: [RoleEnum.SUPERADMIN] },

		//hr
		{ path: "/type-leave", element: <ListTypeLeave />, allowedRoles: [RoleEnum.HR] },
		{ path: "/user", element: <ListUser />, allowedRoles: [RoleEnum.HR] },
		{ path: "/user/create", element: <CreateUser />, allowedRoles: [RoleEnum.HR] },
		{ path: "/user/role-and-permission/:usercode", element: <RoleAndPermissionUser />, allowedRoles: [RoleEnum.SUPERADMIN] },
		{ path: "/user/org-chart", element: <OrgChart />, allowedRoles: [RoleEnum.HR] },
		{ path: "/hr-mng-timekeeping", element: <HRManagementTimekeeping />, allowedRoles: [RoleEnum.HR] },
		{ path: "/hr-mng-leave-request", element: <HRManagementLeaveRequest />, allowedRoles: [RoleEnum.HR] },
		{ path: "/change-org-unit", element: <ChangeOrgUnit />, allowedRoles: [RoleEnum.HR] },

		//memo notification
		{ path: "/memo-notify", element: <MemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION, RoleEnum.IT_ADMIN], allowedPermissions: ['memo_notification.create'] },
		{ path: "/memo-notify/create", element: <CreateMemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION, RoleEnum.IT_ADMIN], allowedPermissions: ['memo_notification.create'] }, 
		{ path: "/memo-notify/edit/:id", element: <CreateMemoNotification/>, allowedRoles: [RoleEnum.HR, RoleEnum.UNION, RoleEnum.IT_ADMIN], allowedPermissions: ['memo_notification.create'] },
		{ path: "/view/memo-notify/:id", element: <ViewOnlyMemoNotification />},
		
		//leave + timekeeping
		{ path: "/leave/statistics", element: <StatisticalLeaveRqForm/> },
		{ path: "/leave", element: <ListLeaveRequest/> },
		{ path: "/leave/create", element: <LeaveRequestFormForOthers/> },
		{ path: "/leave/edit/:id", element: <LeaveRequestFormForOthers/> },
		{ path: "/leave/leave-registered", element: <ListLeaveRequestRegistered/> },

		//overtime
		{ path: "/overtime", element: <ListMyOverTime/> },
		{ path: "/overtime/overtime-registered", element: <ListOverTimeRegister/> },
		{ path: "/overtime/create", element: <CreateOverTime/> },
		{ path: "/overtime/edit/:id", element: <CreateOverTime/> },

		//internal hr
		{ path: "/internal-memo-hr", element: <ListInternalMemoHR/> },
		{ path: "/internal-memo-hr/create", element: <CreateInternalMemoHR/> },
		{ path: "/internal-memo-hr/edit/:id", element: <CreateInternalMemoHR/> },

		{ path: "/time-keeping", element: <Timekeeping/>},
		{ path: "/management-time-keeping", element: <MngTimekeeping/>},
		{ path: "/list-time-keeping", element: <ListTimeKeeping/>},

		//form it
		{ path: "/form-it/statistical", element: <StatisticalFormIT />, allowedRoles: [RoleEnum.IT_ADMIN]},
		{ path: "/form-it/all-form-it", element: <ListFormIT />, allowedRoles: [RoleEnum.IT_ADMIN]},
		{ path: "/form-it/create", element: <CreateFormIT />, allowedRoles: [RoleEnum.IT_ADMIN, RoleEnum.IT_USER]},
		{ path: "/form-it", element: <ListFormIT />, allowedRoles: [RoleEnum.IT_ADMIN, RoleEnum.IT_USER]},
		{ path: "/form-it/edit/:id", element: <CreateFormIT />, allowedRoles: [RoleEnum.IT_ADMIN, RoleEnum.IT_USER]},
		{ path: "/form-it/list-item-wait-form-purchase", element: <ListITFormWaitFormPurchase />, allowedRoles: [RoleEnum.IT_ADMIN]},

		//purchasing
		{ path: "/purchase/statistical", element: <StatisticalFormPurchase />, allowedRoles: [RoleEnum.PURCHASE_ADMIN]},
		{ path: "/purchase/create", element: <CreateFormPurchase />, allowedRoles: [RoleEnum.PURCHASE_ADMIN, RoleEnum.PURCHASE_USER]},
		{ path: "/purchase", element: <ListFormPurchase />, allowedRoles: [RoleEnum.PURCHASE_ADMIN, RoleEnum.PURCHASE_USER]},
		{ path: "/purchase/edit/:id", element: <CreateFormPurchase />, allowedRoles: [RoleEnum.PURCHASE_ADMIN, RoleEnum.PURCHASE_USER]},
		{ path: "/purchase/all-form-purchase", element: <AllFormPurchase />, allowedRoles: [RoleEnum.PURCHASE_ADMIN]},
		{ path: "/purchase/list-item-wait-quote", element: <ListItemWaitQuote />, allowedRoles: [RoleEnum.PURCHASE_ADMIN]},

		//vote
		{ path: "/vote/create", element: <CreateVote />, allowedRoles: [RoleEnum.UNION, RoleEnum.HR] },
		{ path: "/vote/edit/:id", element: <CreateVote />, allowedRoles: [RoleEnum.UNION, RoleEnum.HR] },
		{ path: "/vote", element: <ListVote />},
		{ path: "/vote/:id", element: <DetailVote />},

		{ path: "/union/member", element: <MngMemberUnion />, allowedRoles: [RoleEnum.UNION]},

		//SAP
		{path: '/sap/statistics', element: <SAPComponent/>, allowedRoles: [RoleEnum.IT_ADMIN, RoleEnum.SUPERADMIN]},
		{path: '/sap/config', element: <ConfigUserAssignSAP/>, allowedRoles: [RoleEnum.SUPERADMIN]},
		{path: '/sap/create', element: <CreateSAP/>, allowedRoles: [RoleEnum.SAP]},
		{path: '/sap', element: <ListSAPRegistered/>, allowedRoles: [RoleEnum.SAP]},

		//FAQ
		{path: '/faq', element: <ListFAQ/>},
		{path: '/mng-faq', element: <MngFAQ/>, allowedRoles: [RoleEnum.HR]},
		{path: '/faq/create', element: <CreateFAQ/>, allowedRoles: [RoleEnum.HR]},
		{path: '/faq/edit/:id', element: <CreateFAQ/>, allowedRoles: [RoleEnum.HR]},

		{ path: '/view-approval/:id', element: <DetailApproval />},
		{ path: '/view/:id', element: <ViewDetail />},

		//approval
		{ path: "/approval/pending-approval", element: <PendingApproval />},
		{ path: "/approval/assigned-tasks", element: <AssignedTasks />},
		{ path: "/approval/approval-history", element: <ApprovalHistory />,},
		{ path: "/approval/wait-confirm", element: <WaitConfirm />,},
		{ path: "/approval/wait-quote", element: <WaitQuote />},

		//warning letter
		{path: '/warningletter/create', element: <CreateWarningLetter/>},
		{path: '/warningletter/edit/:id', element: <CreateWarningLetter/>},
		{path: '/warningletter', element: <ListWarningLetter/>},

		//regination
		{path: '/resignation/create', element: <CreateResignation/>},
		{path: '/resignation/edit/:id', element: <CreateResignation/>},
		{path: '/resignation', element: <ListRegnation/>},

		//termination
		{path: '/termination/create', element: <CreateTermination/>, allowedRoles: [RoleEnum.HR]},
		{path: '/termination/edit/:id', element: <CreateTermination/>, allowedRoles: [RoleEnum.HR]},
		{path: '/termination', element: <ListTermination/>, allowedRoles: [RoleEnum.HR]},

		//absent over 5 day
		{path: '/absent-over-day', element: <ListAbsentOverDay/>, allowedRoles: [RoleEnum.HR]},

		//requisition letter
		{path: '/requisition/create', element: <CreateRequisition/>},
		{path: '/requisition/edit/:id', element: <CreateRequisition/>},
		{path: '/requisition', element: <ListRequisition/>},

		{path: '/feedback/create', element: <CreateFeedback/>},
		{path: '/feedback/edit/:id', element: <CreateFeedback/>},
		{path: '/feedback/my-feedback', element: <ListMyFeedback/>},
		{path: '/feedback/pending-response', element: <PendingResponse/>, allowedRoles: [RoleEnum.HR]},
		{path: '/feedback', element: <AllFeedback/>, allowedRoles: [RoleEnum.HR]},
		{path: '/feedback/view/:id', element: <ViewFeedback/>},
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
