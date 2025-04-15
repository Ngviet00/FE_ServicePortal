import { create } from "zustand";
import { SIDEBAR_MENUS } from "@/constants/sidebar";

type SidebarMenuKey = NonNullable<typeof SIDEBAR_MENUS[number]["key"]>;

interface SidebarState {
	setVisibleSubmenuByPath: (path: string) => void;
	isOpen: boolean;
	submenusVisible: Record<SidebarMenuKey, boolean>;
	toggleSidebar: () => void;
	toggleSubmenu: (menu: SidebarMenuKey) => void;
	closeAllSubmenus: () => void;
	closeMenuIfNotChild: (pathname: string) => void;
}

const initialSubmenusVisible = SIDEBAR_MENUS.reduce((acc, item) => {
	if (item.key) acc[item.key] = false;
	return acc;
}, {} as Record<SidebarMenuKey, boolean>);

export const useSidebarStore = create<SidebarState>((set, get) => ({
	isOpen: true,
	submenusVisible: initialSubmenusVisible,

	toggleSidebar: () => {
		const next = !get().isOpen;
		set({
			isOpen: next,
			submenusVisible: next ? get().submenusVisible : initialSubmenusVisible,
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
		const matchedMenu = SIDEBAR_MENUS.find(
			(menu) => menu.children?.some((child) => pathname.startsWith(child.route))
		);
	
		if (matchedMenu?.key) {
			set({
				submenusVisible: {
					...Object.fromEntries(SIDEBAR_MENUS.map((m) => [m.key, false])),
					[matchedMenu.key]: true
				}
			});
		}
	},

	closeMenuIfNotChild: (pathname: string) => {
        const matchedMenu = SIDEBAR_MENUS.find((menu) => 
            menu.children?.some((child) => pathname.startsWith(child.route))
        );
        if (!matchedMenu) {
            set({
                submenusVisible: Object.fromEntries(SIDEBAR_MENUS.map((m) => [m.key, false])),
            });
        }
    },
}));