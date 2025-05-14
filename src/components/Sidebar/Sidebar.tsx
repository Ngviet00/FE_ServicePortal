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
		<div className={`sidebar ${isOpen ? "" : "collapsed"} bg-white dark:bg-[#1b1b1f] w-[250px]`}>
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
						className={`sidebar-link flex items-center hover:bg-[#e3e3e3] text-blue-900 dark:hover:bg-[#e3e3e3] dark:hover:text-black ${
							currentPath === "/" ? "bg-[#e3e3e3] dark:text-black" : "dark:text-white"
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
								className="menu-title hover:bg-[#e3e3e3] flex items-center cursor-pointer text-blue-900 dark:text-white dark:hover:text-black"
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
							<ul className={`submenu ${submenusVisible["HR"] ? "open" : ""} `}>
								{
									isSuperAdmin && (
										<li className={`text-blue-900 ${currentPath === "/role" ? "bg-[#e3e3e3]" : ""}`}>
											<Link to="/role" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/role' ? 'dark:text-black' : 'dark:text-white'}`}>
												<Dot />
												<span>{t("sidebar.admin.role")}</span>
											</Link>
										</li>
									)
								}

								<li className={`text-blue-900 ${currentPath === "/type-leave" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/type-leave" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/type-leave' ? 'dark:text-black' : 'dark:text-white'}`}>
										<Dot />
										<span>{t("Loại phép")}</span>
									</Link>
								</li>

								{/* <li className={`text-blue-900 ${currentPath === "/department" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/department" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/department' ? 'dark:text-black' : 'dark:text-white'}`}>
										<Dot />
										<span>{t("sidebar.admin.department")}</span>
									</Link>
								</li> */}
								<li className={`text-blue-900 ${currentPath === "/user" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/user" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/user' ? 'dark:text-black' : 'dark:text-white'}`}>
										<Dot />
										<span>{t("sidebar.user.list")}</span>
									</Link>
								</li>
								{/* <li className={`text-blue-900 ${currentPath === "/user/create" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/user/create" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/user/create' ? 'dark:text-black' : 'dark:text-white'}`}>
										<Dot />
										<span>{t("sidebar.user.create")}</span>
									</Link>
								</li> */}
								{/* <li className={`text-blue-900 ${currentPath === "/user/org-chart" ? "bg-[#e3e3e3]" : ""}`}>
									<Link to="/user/org-chart" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/user/org-chart' ? 'dark:text-black' : 'dark:text-white'}`}>
										<Dot />
										<span>{t("Sơ đồ tổ chức")}</span>
									</Link>
								</li> */}
								{/* {
									isSuperAdmin && (
										<li className={`text-blue-900 ${currentPath === "/approval-flow" ? "bg-[#e3e3e3]" : ""}`}>
											<Link to="/approval-flow" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/approval-flow' ? 'dark:text-black' : 'dark:text-white'}`}>
												<Dot />
												<span>{t("Tùy chỉnh phê duyệt")}</span>
											</Link>
										</li>
									)
								} */}
							</ul>
						</div>
					</>)
				}

				<div className="menu-group">
					<div
						className="menu-title hover:bg-[#e3e3e3] flex items-center cursor-pointer text-blue-900 dark:text-white dark:hover:text-black"
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
						<li className={`text-blue-900 ${currentPath === "/leave/create" ? "bg-[#e3e3e3]" : ""} dark:text-white dark:hover:text-black`}>
							<Link to="/leave/create" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/leave/create' ? 'dark:text-black' : 'dark:text-white'}`}>
								<Dot />
								<span>{t("sidebar.leave_request.create")}</span>
							</Link>
						</li>
						<li className={`text-blue-900 ${currentPath === "/leave" ? "bg-[#e3e3e3]" : ""} dark:text-white dark:hover:text-black`}>
							<Link to="/leave" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/leave' ? 'dark:text-black' : 'dark:text-white'}`}>
								<Dot />
								<span>{t("sidebar.leave_request.list")}</span>
							</Link>
						</li>
						<li className={`text-blue-900 ${currentPath === "/leave/wait-approval" ? "bg-[#e3e3e3]" : ""} dark:text-white dark:hover:text-black`}>
							<Link to="/leave/wait-approval" className={`sidebar-link hover:bg-[#e3e3e3] flex items-center dark:hover:text-black ${currentPath == '/leave/wait-approval' ? 'dark:text-black' : 'dark:text-white'}`}>
								<Dot />
								<span>Chờ duyệt</span>
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