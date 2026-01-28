import { RoleEnum } from "@/lib";
import { House, LockKeyhole, Ticket, Users, Bell, ClipboardCheck, Computer, WalletCards, ShieldCheck, MessageCircleQuestion, BookText } from "lucide-react";
import { create } from "zustand";

export interface SidebarMenuItem {
	key: string;
	label: string;
	icon?: React.ElementType;
	route?: string;
	children?: SidebarMenuItem[]
}

export const SIDEBAR_MENUS: SidebarMenuItem[] = [
	{
		key: "home",
		label: "sidebar.home",
		icon: House,
		route: "/",
		children: []
	},
	{
		key: "Admin",
		label: "SuperAdmin",
		icon: LockKeyhole,
		children: [
			{ key: "sidebar.admin.role", label: "sidebar.admin.role", route: "/role" },
			{ key: "sidebar.admin.permission", label: "sidebar.admin.permission", route: "/permission" },
			{ key: "sidebar.admin.RequestTypeEnum", label: "sidebar.admin.RequestTypeEnum", route: "/request-type" },
			{ key: "sidebar.admin.approval_flow", label: "sidebar.admin.approval_flow", route: "/approval-flow" },
			{ key: "sidebar.admin.setting_org_unit", label: "sidebar.admin.setting_org_unit", route: "/setting-org-unit" },
			{ key: "sidebar.admin.config_org_position_role", label: "sidebar.admin.config_org_position_role", route: "/config-org-position-role" },
			{ key: "sidebar.admin.priority", label: "sidebar.admin.priority", route: "/priority" },
			{ key: "sidebar.admin.it_category", label: "sidebar.admin.it_category", route: "/it-category" },
			{ key: "sidebar.admin.admin_setting", label: "sidebar.admin.admin_setting", route: "/admin-setting" },
		],
	},
	{
		key: "MemoNotification",
		label: "sidebar.notification.title",
		icon: Bell,
		children: [
			{ key: 'sidebar.notification.create', label: "sidebar.notification.create", route: "/memo-notify/create" },
			{ key: 'sidebar.notification.list', label: "sidebar.notification.list", route: "/memo-notify" },
		],
	},
	{
		key: "HR",
		label: 'HR Admin',
		icon: Users,
		children: [
			{ key: "sidebar.hr.type_leave", label: "sidebar.hr.type_leave", route: "/type-leave" },
			{ key: "sidebar.hr.list_user", label: "sidebar.hr.list_user", route: "/user" },
			{ key: "sidebar.hr.org", label: "sidebar.hr.org", route: "/user/org-chart" },
			{ key: "sidebar.hr.mng_time_keeping", label: "sidebar.hr.mng_time_keeping", route: "/hr-mng-timekeeping" },
			// { key: "sidebar.hr.mng_leave_request", label: "sidebar.hr.mng_leave_request", route: "/hr-mng-leave-request" },
			{ key: "sidebar.hr.change_org_unit_id_user", label: "sidebar.hr.change_org_unit_id_user", route: "/change-org-unit" },
		],
	},
	{
		key: "leave_request",
		label: "sidebar.hr.title",
		icon: Ticket,
		children: [
			{
				key: "hr_recruit",
				label: "sidebar.hr.recruitment.title",
				children: [
					{ key: "sidebar.hr.recruitment.manpower", label: "sidebar.hr.recruitment.manpower", route: "/requisition/create" },
				]
			},
			{
				key: "hr_resign",
				label: "sidebar.hr.insurance.title",
				children: [
					{ key: "sidebar.hr.insurance.resignation", label: "sidebar.hr.insurance.resignation", route: "/resignation/create" },
					{ key: "sidebar.hr.insurance.termination", label: "sidebar.hr.insurance.termination", route: "/termination/create" },
					{ key: "sidebar.hr.insurance.warningletter", label: "sidebar.hr.insurance.warningletter", route: "/warningletter/create" },
					{ key: "sidebar.hr.insurance.absentover5day", label: "sidebar.hr.insurance.absentover5day", route: "/absent-over-day" },
				]
			},
			{
				key: "hr_time",
				label: "sidebar.hr.leave_request.title",
				children: [
					{ key: "sidebar.hr.leave_request.leave_statistics", label: "sidebar.hr.leave_request.leave_statistics", route: "/leave/statistics" },
					{ key: "sidebar.hr.leave_request.create_leave", label: "sidebar.hr.leave_request.create_leave", route: "/leave/create" },
					{ key: "sidebar.hr.leave_request.over_time", label: "sidebar.hr.leave_request.over_time", route: "/overtime/create" },
					{ key: "sidebar.hr.leave_request.internal_memo_hr", label: "sidebar.hr.leave_request.internal_memo_hr", route: "/internal-memo-hr/create" },
					{ key: "sidebar.hr.leave_request.time_keeping", label: "sidebar.hr.leave_request.time_keeping", route: "/time-keeping" },
					{ key: "sidebar.hr.leave_request.mng_time_keeping", label: "sidebar.hr.leave_request.mng_time_keeping", route: "/management-time-keeping" },
				]
			},
			{ key: "sidebar.union.list", label: "sidebar.union.list", route: `/vote?role=${RoleEnum.HR}` },
			//{ key: 'feedback', label: "FAQ", route: "/feedback" },
		],
	},
	{
		key: "IT",
		label: "sidebar.IT.title",
		icon: Computer,
		children: [
			{ key: "sidebar.IT.statistical", label: "sidebar.IT.statistical", route: "/form-it/statistical" },
			{ key: "sidebar.IT.create", label: "sidebar.IT.create", route: "/form-it/create" },
			{ key: "sidebar.IT.it_form_wait_purchase", label: "sidebar.IT.it_form_wait_purchase", route: "/form-it/list-item-wait-form-purchase" },
		],
	},
	{
		key: "Purchase",
		label: "sidebar.purchase.title",
		icon: WalletCards,
		children: [
			{ key: "sidebar.purchase.statistical", label: "sidebar.purchase.statistical", route: "/purchase/statistical" },
			{ key: "sidebar.purchase.create", label: "sidebar.purchase.create", route: "/purchase/create" },
			{ key: "sidebar.purchase.quote", label: "sidebar.purchase.quote", route: "/purchase/list-item-wait-quote" },
		],
	},
	{
		key: "Union",
		label: "sidebar.union.title",
		icon: ShieldCheck,
		children: [
			{ key: "sidebar.union.member", label: "sidebar.union.member", route: `/union/member` },
			{ key: "sidebar.union.list", label: "sidebar.union.list", route: `/vote?role=${RoleEnum.UNION}` },
		],
	},
	// {
	// 	key: "SAP",
	// 	label: "sidebar.SAP.title",
	// 	icon: BookText,
	// 	children: [
	// 		{ key: "sidebar.SAP.statistics", label: "sidebar.SAP.statistics", route: `/sap/statistics` },
	// 		{ key: "sidebar.SAP.config", label: "sidebar.SAP.config", route: `/sap/config` },
	// 		{ key: "sidebar.SAP.create", label: "sidebar.SAP.create", route: `/sap/create` },
	// 		{ key: "sidebar.SAP.list", label: "sidebar.SAP.list", route: `/sap` },
	// 	],
	// },
	{
		key: "approval",
		label: "sidebar.approval.title",
		icon: ClipboardCheck,
		children: [
			{ key: "sidebar.approval.pending_approval", label: "sidebar.approval.pending_approval", route: "/approval/pending-approval" },
			{ key: "sidebar.approval.assigned", label: "sidebar.approval.assigned", route: "/approval/assigned-tasks" },
			{ key: "sidebar.approval.list_wait_confirm", label: "sidebar.approval.list_wait_confirm", route: "/approval/wait-confirm" },
			{ key: "sidebar.approval.list_wait_quote", label: "sidebar.approval.list_wait_quote", route: "/approval/wait-quote" },
			{ key: "sidebar.approval.history_approval", label: "sidebar.approval.history_approval", route: "/approval/approval-history" },
		],
	},
	{
		key: "feedback",
		label: "sidebar.feedback.title",
		icon: MessageCircleQuestion,
		route: "/feedback",
		children: [
			{ key: "sidebar.feedback.all_feedback", label: "sidebar.feedback.all_feedback", route: "/feedback" },
			{ key: "sidebar.feedback.create", label: "sidebar.feedback.create", route: "/feedback/create" },
			{ key: "sidebar.feedback.my_feedback", label: "sidebar.feedback.my_feedback", route: "/feedback/my-feedback" },
			{ key: "sidebar.feedback.pending_response", label: "sidebar.feedback.pending_response", route: "/feedback/pending-response" },
		]
	},
];

type SidebarMenuKey = typeof SIDEBAR_MENUS[number]["key"];

interface SidebarState {
	isOpen: boolean;
	submenusVisible: Record<string, boolean>;
	toggleSidebar: () => void;
	closeSidebar: () => void;
	toggleSubmenu: (menu: SidebarMenuKey) => void;
	closeAllSubmenus: () => void;
	setVisibleSubmenuByPath: (path: string, parentKey?: string) => void;
}

const getAllMenuKeys = (menus: SidebarMenuItem[]): string[] => {
	return menus.flatMap(menu => [
		menu.key,
		...(menu.children ? getAllMenuKeys(menu.children) : [])
	]);
};

const allMenuKeys = getAllMenuKeys(SIDEBAR_MENUS);

const initialSubmenusVisible = allMenuKeys.reduce((acc, key) => {
	acc[key] = false;
	return acc;
}, {} as Record<string, boolean>);

const findParentKeys = (menus: SidebarMenuItem[], path: string): string[] => {
	for (const menu of menus) {
		if (menu.route === path) return [menu.key];
		if (menu.children) {
			const childPath = findParentKeys(menu.children, path);
			if (childPath.length) return [menu.key, ...childPath];
		}
	}
	return [];
};

export const useSidebarStore = create<SidebarState>((set, get) => ({
	isOpen: false,
	submenusVisible: initialSubmenusVisible,

	toggleSidebar: () => {
		const next = !get().isOpen;
		set({
			isOpen: next,
			submenusVisible: next ? get().submenusVisible : initialSubmenusVisible,
		});
	},

	closeSidebar: () => {
		set({
			isOpen: false,
			submenusVisible: initialSubmenusVisible,
		});
	},

	toggleSubmenu: (key: string) => {
		set((state) => ({
			submenusVisible: {
				...state.submenusVisible,
				[key]: !state.submenusVisible[key],
			},
		}));
	},

	closeAllSubmenus: () => set({ submenusVisible: initialSubmenusVisible }),

	setVisibleSubmenuByPath: (pathname: string) => {
		const keysToOpen = findParentKeys(SIDEBAR_MENUS, pathname);
		set((state) => {
			const newSubmenus = { ...state.submenusVisible };
			keysToOpen.forEach(k => { newSubmenus[k] = true; });
			return { submenusVisible: newSubmenus };
		});
	},
}));