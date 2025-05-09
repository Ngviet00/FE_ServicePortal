import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Dot, House, LockKeyhole, Ticket } from "lucide-react";
import { useSidebarStore } from "@/store/sidebarStore";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import leaveRequestApi from "@/api/leaveRequestApi";

import "./style.css";
import useHasRole from "../../hooks/HasRole";

export default function Sidebar() {
	const { t } = useTranslation();
	const location = useLocation();
	const currentPath = location.pathname;

	const {
		isOpen,
		submenusVisible,
		toggleSubmenu,
		closeAllSubmenus,
		closeMenuIfNotChild,
		setVisibleSubmenuByPath,
	} = useSidebarStore();

	useEffect(() => {
		setVisibleSubmenuByPath(currentPath);
		closeMenuIfNotChild(currentPath);
	}, [currentPath, setVisibleSubmenuByPath, closeMenuIfNotChild]);

	const handleMenuHomeClick = () => closeAllSubmenus();

	const { user } = useAuthStore();

	const { data: countWaitApprovalLeaveRequest } = useQuery({
		queryKey: ["count-wait-approval-leave-request"],
		queryFn: async () => {
			const res = await leaveRequestApi.countWaitApprovalLeaveRequest({
				department_id: user?.department?.id ?? undefined,
				level: user?.level ?? undefined,
			});
			return res.data.data;
		},
	});

	const hasHRRole = useHasRole(['HR', 'HR_Manager']);

	const isSuperAdmin = useHasRole(['superadmin']);

	return (
		<div className={`sidebar ${isOpen ? "" : "collapsed"}`}>
			<div>
				<a href="/">
					<img src="/logo.png" alt="Logo" style={{ height: "80px" }} />
				</a>
			</div>

			<hr className="mt-1" />

			<nav className="pt-2">
				{/* HOME MENU */}
				<div className="menu-group">
					<Link
						onClick={handleMenuHomeClick}
						to="/"
						className={`sidebar-link flex items-center text-blue-900 ${
							currentPath === "/" ? "bg-[#e3e3e3]" : ""
						}`}
					>
						<House size={20} />
						<span className="pl-5">{t("sidebar.home")}</span>
					</Link>
				</div>
			    
				{
					hasHRRole && (<>
						<div className="menu-group">
							<div
								className="menu-title flex items-center cursor-pointer text-blue-900"
								onClick={() => toggleSubmenu("HR")}
							>
								<LockKeyhole size={20} />
								<span className="pl-5 flex-1">HR</span>
								<ChevronDown
									size={18}
									className={`submenu-toggle transition-transform ${
										submenusVisible["HR"] ? "rotate-180" : ""
									}`}
								/>
							</div>
							<ul className={`submenu ${submenusVisible["HR"] ? "open" : ""}`}>
								{
									isSuperAdmin && (
										<li className={`text-blue-900 ${currentPath === "/role" ? "bg-[#e3e3e3]" : ""}`}>
											<Link to="/role" className="sidebar-link flex items-center">
												<Dot />
												<span>{t("sidebar.admin.role")}</span>
											</Link>
										</li>
									)
								}

								<li className={`text-blue-900 ${currentPath === "/department" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/department" className="sidebar-link flex items-center">
										<Dot />
										<span>{t("sidebar.admin.department")}</span>
									</Link>
								</li>
								<li className={`text-blue-900 ${currentPath === "/user" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/user" className="sidebar-link flex items-center">
										<Dot />
										<span>{t("sidebar.user.list")}</span>
									</Link>
								</li>
								<li className={`text-blue-900 ${currentPath === "/user/create" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/user/create" className="sidebar-link flex items-center">
										<Dot />
										<span>{t("sidebar.user.create")}</span>
									</Link>
								</li>
								<li className={`text-blue-900 ${currentPath === "/user/org-chart" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/user/org-chart" className="sidebar-link flex items-center">
										<Dot />
										<span>{t("Sơ đồ tổ chức")}</span>
									</Link>
								</li>
								<li className={`text-blue-900 ${currentPath === "/type-leave" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/type-leave" className="sidebar-link flex items-center">
										<Dot />
										<span>{t("Loại phép")}</span>
									</Link>
								</li>
								{
									isSuperAdmin && (
										<li className={`text-blue-900 ${currentPath === "/approval-flow" ? "bg-[#e3e3e3]" : ""}`}>
											<Link to="/approval-flow" className="sidebar-link flex items-center">
												<Dot />
												<span>{t("Tùy chỉnh phê duyệt")}</span>
											</Link>
										</li>
									)
								}
							</ul>
						</div>
					</>)
				}

				<div className="menu-group">
					<div
						className="menu-title flex items-center cursor-pointer text-blue-900"
						onClick={() => toggleSubmenu("leave_request")}
					>
						<Ticket size={20} />
						<span className="pl-5 flex-1">
							{t("sidebar.leave_request.leave_request")}
							{countWaitApprovalLeaveRequest > 0 && (
								<span className="pl-1 text-red-500 font-bold">
									({countWaitApprovalLeaveRequest})
								</span>
							)}
						</span>
						<ChevronDown
							size={18}
							className={`submenu-toggle transition-transform ${
								submenusVisible["leave_request"] ? "rotate-180" : ""
							}`}
						/>
					</div>
					<ul className={`submenu ${submenusVisible["leave_request"] ? "open" : ""}`}>
						<li className={`text-blue-900 ${currentPath === "/leave/create" ? "bg-[#e3e3e3]" : ""}`}>
							<Link to="/leave/create" className="sidebar-link flex items-center">
								<Dot />
								<span>{t("sidebar.leave_request.create")}</span>
							</Link>
						</li>
						<li className={`text-blue-900 ${currentPath === "/leave" ? "bg-[#e3e3e3]" : ""}`}>
							<Link to="/leave" className="sidebar-link flex items-center">
								<Dot />
								<span>{t("sidebar.leave_request.list")}</span>
							</Link>
						</li>
						<li className={`text-blue-900 ${currentPath === "/leave/wait-approval" ? "bg-[#e3e3e3]" : ""}`}>
							<Link to="/leave/wait-approval" className="sidebar-link flex items-center">
								<Dot />
								<span>Wait approval</span>
								{countWaitApprovalLeaveRequest > 0 && (
									<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
										({countWaitApprovalLeaveRequest})
									</span>
								)}
							</Link>
						</li>
					</ul>
				</div>
			</nav>
		</div>
	);
}