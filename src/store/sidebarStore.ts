import { House, LockKeyhole, Ticket, Users, Bell, Computer, ClipboardCheck } from "lucide-react";
import { create } from "zustand";

export interface SidebarMenuItem {
	key: string;
	label: string;
	icon: React.ElementType;
	route?: string;
	children?: { label: string; route: string, parentKey?: string }[];
}

export const SIDEBAR_MENUS: SidebarMenuItem[] = [
	{
		key: "home",
		label: "sidebar.home",
		icon: House,
		route: "/",
		children: [],
	},
	{
		key: "Admin",
		label: "Admin",
		icon: LockKeyhole,
		children: [
			{ label: "sidebar.admin.admin_setting", route: "/admin-setting" },
			{ label: "sidebar.admin.role", route: "/role" },
			{ label: "Permission", route: "/permission" },
			{ label: "Request Type", route: "/request-type" },
			{ label: "Work Flow", route: "/work-flow" },
		],
	},
	{
		key: "HR",
		label: "HR",
		icon: Users,
		children: [
			{ label: "sidebar.hr.type_leave", route: "/type-leave" },
			{ label: "sidebar.hr.list_user", route: "/user" },
			{ label: "sidebar.hr.org", route: "/user/org-chart" },
			{ label: "sidebar.hr.mng_time_keeping", route: "/hr-mng-timekeeping" },
			{ label: "sidebar.hr.mng_leave_request", route: "/hr-mng-leave-request" },
			{ label: "sidebar.hr.change_org_unit_id_user", route: "/change-org-unit" },
		],
	},
	{
		key: "MemoNotification",
		label: "sidebar.notification.title",
		icon: Bell,
		children: [
			{ label: "sidebar.notification.create", route: "/memo-notify/create" },
			{ label: "sidebar.notification.list", route: "/memo-notify" },
		],
	},
	{
		key: "leave_request",
		label: "sidebar.leave_request.title",
		icon: Ticket,
		children: [
			{ label: "sidebar.leave_request.create_leave", route: "/leave/create" },
			{ label: "sidebar.leave_request.create_leave_for_others", route: "/leave/create-leave-for-others" },
			{ label: "sidebar.leave_request.list_leave", route: "/leave" },
			{ label: "sidebar.leave_request.time_keeping", route: "/time-keeping" },
			{ label: "sidebar.leave_request.mng_time_keeping", route: "/management-time-keeping" },
		],
	},
	{
		key: "IT",
		label: "sidebar.IT.title",
		icon: Computer,
		children: [
			{ label: "sidebar.IT.statistical", route: "/form-it/statistical" },
			{ label: "sidebar.IT.create", route: "/form-it/create" },
			{ label: "sidebar.IT.list", route: "/form-it" },
			{ label: "sidebar.IT.setting", route: "/form-it/setting" },
		],
	},
	{
		key: "approval",
		label: "sidebar.approval.title",
		icon: ClipboardCheck,
		children: [
			{ label: "sidebar.approval.pending_approval", route: "/approval/pending-approval" },
			{ label: "sidebar.approval.assigned", route: "/approval/assigned-tasks" },
			{ label: "sidebar.approval.history_approval", route: "/approval/approval-history" },
		],
	}
];

type SidebarMenuKey = typeof SIDEBAR_MENUS[number]["key"];

interface SidebarState {
	isOpen: boolean;
	submenusVisible: Record<SidebarMenuKey, boolean>;
	toggleSidebar: () => void;
	closeSidebar: () => void;
	toggleSubmenu: (menu: SidebarMenuKey) => void;
	closeAllSubmenus: () => void;
	setVisibleSubmenuByPath: (path: string, parentKey?: string) => void;
	closeMenuIfNotChild: (pathname: string) => void;
}

const initialSubmenusVisible = SIDEBAR_MENUS.reduce((acc, item) => {
	acc[item.key] = false;
	return acc;
}, {} as Record<SidebarMenuKey, boolean>);

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

	toggleSubmenu: (menu) => {
		const current = get().submenusVisible[menu];
		const newState = Object.fromEntries(
			Object.keys(get().submenusVisible).map((key) => [key, false])
		) as Record<SidebarMenuKey, boolean>;
		newState[menu] = !current;
		set({ submenusVisible: newState });
	},

	closeAllSubmenus: () => set({ submenusVisible: initialSubmenusVisible }),

	setVisibleSubmenuByPath: (pathname: string, parentKey?: string) => {
		const matchedMenu = parentKey
			? SIDEBAR_MENUS.find((menu) => menu.key === parentKey)
			: SIDEBAR_MENUS.find((menu) =>
				menu.children?.some((child) => pathname === child.route)
			) ?? SIDEBAR_MENUS.find((menu) =>
				menu.children?.some((child) => pathname.startsWith(child.route))
			);

		if (matchedMenu) {
			set({
				submenusVisible: {
					...Object.fromEntries(SIDEBAR_MENUS.map((m) => [m.key, false])),
					[matchedMenu.key]: true,
				},
			});
		}
	},

	closeMenuIfNotChild: (pathname: string) => {
		const matchedMenu = SIDEBAR_MENUS.find((menu) =>
			menu.children?.some((child) => pathname.startsWith(child.route))
		);
		if (!matchedMenu) {
			set({
				submenusVisible: Object.fromEntries(
					SIDEBAR_MENUS.map((m) => [m.key, false])
				),
			});
		}
	},
}));