import { House, LockKeyhole, Ticket, ShieldCheck, Users } from "lucide-react";
import { create } from "zustand";

export interface SidebarMenuItem {
	key: string;
	label: string;
	icon: React.ElementType;
	route?: string;
	children?: { label: string; route: string }[];
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
			{ label: "sidebar.union.create_notify", route: "/memo-notify" },
			{ label: "Quản lý chấm công", route: "/hr-management-timekeeping" },
		],
	},
	{
		key: "Union",
		label: "sidebar.union.union",
		icon: ShieldCheck,
		children: [
			{ label: "sidebar.union.create_notify", route: "/memo-notify" },
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
			{ label: "sidebar.leave_request.wait_approval", route: "/leave/wait-approval" },
			{ label: "sidebar.time_keeping.time_keeping", route: "/time-keeping" },
			{ label: "sidebar.time_keeping.mng_time_keeping", route: "/management-time-keeping" },
		],
	},
];

type SidebarMenuKey = typeof SIDEBAR_MENUS[number]["key"];

interface SidebarState {
	isOpen: boolean;
	submenusVisible: Record<SidebarMenuKey, boolean>;
	toggleSidebar: () => void;
	closeSidebar: () => void;
	toggleSubmenu: (menu: SidebarMenuKey) => void;
	closeAllSubmenus: () => void;
	setVisibleSubmenuByPath: (path: string) => void;
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

	setVisibleSubmenuByPath: (pathname: string) => {
		const matchedMenu = SIDEBAR_MENUS.find((menu) =>
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