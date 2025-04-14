export type SidebarConfig = {
	visible: boolean
	submenus: {
		user: boolean
		category: boolean
		admin: boolean
	}
	toggleSubmenu: (menu: 'user' | 'category' | 'admin') => void
}