export type SidebarConfig = {
	visible: boolean
	submenus: {
		user: boolean
		category: boolean
	}
	toggleSubmenu: (menu: 'user' | 'category') => void
}