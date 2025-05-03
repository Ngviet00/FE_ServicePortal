import { Link, useLocation  } from "react-router-dom";
import { ChevronDown, Dot } from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import { SIDEBAR_MENUS } from "@/lib/sidebar";
import { useEffect } from "react";

import "./style.css"
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import leaveRequestApi from "@/api/leaveRequestApi";

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

	const { user } = useAuthStore();
	
    const { data: countWaitApprovalLeaveRequest } = useQuery({
        queryKey: ['count-wait-approval-leave-request'],
        queryFn: async () => {
            const res = await leaveRequestApi.countWaitApprovalLeaveRequest({
				department_id: user?.department?.id ?? undefined,
				level: user?.level ?? undefined
			});
            return res.data.data;
        },
    });

    return (
		<div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
			<div>
				<a href="/">
					<img src="/logo.png" alt="" style={{ height: '80px'}}/>
				</a>
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
								<span className="pl-5 flex-1">
									{t(menu.label)}
									{
										countWaitApprovalLeaveRequest > 0 && menu.key == "leave_request" ? <span className="pl-1 text-red-500 font-bold">({countWaitApprovalLeaveRequest})</span> : ""
									}
								</span>
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
												{
													countWaitApprovalLeaveRequest > 0 && child.route == '/leave/wait-approval' ? <span className="text-red-500 font-bold" style={{ paddingLeft: '5px' }}>({countWaitApprovalLeaveRequest})</span> : ""
												}
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