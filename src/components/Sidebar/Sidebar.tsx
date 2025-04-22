import { Link, useLocation  } from "react-router-dom";
import { ChevronDown, Dot } from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import { SIDEBAR_MENUS } from "@/lib/sidebar";
import { useEffect } from "react";

import "./style.css"
import { useTranslation } from "react-i18next";

export default function Sidebar() {
	const { t } = useTranslation();
	const { isOpen, submenusVisible, toggleSubmenu, closeAllSubmenus, closeMenuIfNotChild } = useSidebarStore();
	const location = useLocation();
	const currentPath = location.pathname;
	const setVisibleSubmenuByPath = useSidebarStore((state) => state.setVisibleSubmenuByPath);

	useEffect(() => {
		setVisibleSubmenuByPath(currentPath);
		closeMenuIfNotChild(currentPath);
	}, [currentPath, setVisibleSubmenuByPath, closeMenuIfNotChild]);

	const handleMenuHomeClick = () => {
		closeAllSubmenus();
	};

    return (
		<div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
			<div>
				<Link to="/">
					<img src="/logo.png" alt="" style={{ height: '80px'}}/>
				</Link>
			</div>

			<hr className="mt-1" />

			<nav className="pt-2">
				{SIDEBAR_MENUS.map((menu) => {
					if (!menu.key || !menu.label || !menu.icon) {
						return null
					}

					const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;
					const Icon = menu.icon;

					//home
					if (!hasChildren && menu.route) {
						return (
							<div className="menu-group" key={menu.key}>
								<Link
									onClick={() => handleMenuHomeClick()}
									to={menu.route}
									className={`sidebar-link flex items-center text-blue-900 ${
										currentPath === menu.route ? 'bg-[#e3e3e3]' : ''
									}`}
								>
									<Icon size={20} />
									<span className="pl-5">{t(menu.label)}</span>
								</Link>
							</div>
						);
					}

					return (
						<div className="menu-group" key={menu.key}>
							<div
								className="menu-title flex items-center cursor-pointer text-blue-900"
								onClick={() => hasChildren && toggleSubmenu(menu.key!)}
							>
								<Icon size={20} />
								<span className="pl-5 flex-1">{t(menu.label)}</span>
								{hasChildren && (
									<ChevronDown
										size={18}
										className={`submenu-toggle transition-transform ${
											submenusVisible[menu.key!] ? "rotate-180" : ""
										}`}
									/>
								)}
							</div>
							{hasChildren && (
								<ul className={`submenu ${submenusVisible[menu.key!] ? "open" : ""}`}>
									{menu.children?.map((child) => (
										<li key={child.route} className={`text-blue-900 ${currentPath === `${child.route}` ? 'bg-[#e3e3e3]' : ''}`}>
											<Link to={child.route} className="sidebar-link flex items-center">
												<Dot />
												<span>{t(child.label)}</span>
											</Link>
										</li>
									))}
								</ul>
							)}
						</div>
					);
				})}
			</nav>
      </div>
	);
}