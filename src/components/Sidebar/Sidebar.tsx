import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Dot, X } from "lucide-react";
import { useSidebarStore, SIDEBAR_MENUS } from "@/store/sidebarStore";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { RoleEnum } from "@/lib";
import useIsReponsive from "@/hooks/IsResponsive";
import useHasRole from "@/hooks/useHasRole";
import "./style.css"
import approvalApi from "@/api/approvalApi";

export default function Sidebar() {
	const { t } = useTranslation();
	const location = useLocation();
	const currentPath = location.pathname;

	const closeSidebar = useSidebarStore((s) => s.closeSidebar);
	const {
		isOpen,
		submenusVisible,
		toggleSubmenu,
		// closeAllSubmenus,
		// closeMenuIfNotChild,
		setVisibleSubmenuByPath,
	} = useSidebarStore();

	const { user } = useAuthStore()
	const isSuperAdmin = useHasRole([RoleEnum.SUPERADMIN])
	const hasHRRole = useHasRole([RoleEnum.HR])
	// const isUnion = useHasRole([RoleEnum.UNION])
	const isIT = useHasRole([RoleEnum.IT])
	const isPurchase = useHasRole([RoleEnum.PURCHASING])

	// const hasPermissionCreateNotification = useHasPermission(['memo_notification.create'])
	const isMobile = useIsReponsive()
	// const havePermissionMngTimeKeeping = useHasPermission(['time_keeping.mng_time_keeping'])
	const isOrgUnitIdAvailable = user !== null && user !== undefined && user.orgPositionId !== null && user.orgPositionId !== undefined;

	const { data: countWaitApprovalSidebar } = useQuery({
		queryKey: ["count-wait-approval-sidebar"],
		queryFn: async () => {
			const res = await approvalApi.CountWaitApprovalAndAssignedInSidebar({
				UserCode: user?.userCode,
				OrgPositionId: user?.orgPositionId ?? -9999,
			});
			return res.data.data;
		},
		enabled: isOrgUnitIdAvailable
	});

	useEffect(() => {
		setVisibleSubmenuByPath(currentPath);
		// closeMenuIfNotChild(currentPath);
		if (isMobile) closeSidebar();
	}, [closeSidebar, currentPath, isMobile, setVisibleSubmenuByPath]);

	// const handleMenuHomeClick = () => closeAllSubmenus();

	return (
		<div className={`sidebar ${isOpen ? "collapsed" : ""} bg-white dark:bg-[#1b1b1f] w-[250px]`}>
			<div className="relative">
				<a href="/" className="block text-black text-3xl py-4 font-bold h-[65px] line-h-[50px] dark:text-white">
					Service Portal
				</a>
				<button className="toggle-btn-mobile absolute top-[45%] right-2 hover:cursor-pointer" onClick={closeSidebar}>
					<X className="text-black" />
				</button>
			</div>

			<hr className="mt-1" />

			<nav className="pt-2">
				{SIDEBAR_MENUS.map((menu) => {
					if (menu.key === "home") {
						return (
							<div className="menu-group" key={menu.key}>
								<a href="/" className={`sidebar-link flex items-center hover:bg-[#e3e3e3] text-blue-900 dark:hover:bg-[#e3e3e3] dark:hover:text-black ${
										currentPath === menu.route ? "bg-[#e3e3e3] dark:text-black" : "dark:text-white"
									}`}>
									<menu.icon size={20} />
									<span className="pl-5">{t(menu.label)}</span>
								</a>
							</div>
						);
					}

					if (menu.key == 'Admin' && !isSuperAdmin) return null;
					if (menu.key == 'HR' && !hasHRRole) return null;

					// if (menu.key == 'MemoNotification') {
					// 	if (!isUnion && !isIT && !hasHRRole && !hasPermissionCreateNotification) {
					// 		return null;
					// 	}
					// }

					return (
						<div className="menu-group" key={menu.key}>
							<div
								className="menu-title hover:bg-[#e3e3e3] flex items-center cursor-pointer text-blue-900 dark:text-white dark:hover:text-black"
								onClick={() => toggleSubmenu(menu.key)}
							>
								<menu.icon size={20} />
								<span className="pl-5 flex-1">
									{t(menu.label)}
									{ 
										countWaitApprovalSidebar?.total > 0 && menu.key == "approval"
											? <span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>({countWaitApprovalSidebar?.total})</span>
											: <></>
									}
									{
										countWaitApprovalSidebar?.countFormITWaitFormPurchase > 0 && menu.key == "IT"
											? <span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>({countWaitApprovalSidebar?.countFormITWaitFormPurchase})</span>
											: <></>
									}
									{
										countWaitApprovalSidebar?.countWaitResponseQuote > 0 && menu.key == "Purchase"
											? <span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>({countWaitApprovalSidebar?.countWaitResponseQuote})</span>
											: <></>
									}

									{
										countWaitApprovalSidebar?.countVoteIsOpen > 0 && menu.key == "Vote"
											? <span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>({countWaitApprovalSidebar?.countVoteIsOpen})</span>
											: <></>
									}
									
								</span>
								<ChevronDown
									size={18}
									className={`submenu-toggle transition-transform ${
										submenusVisible[menu.key] ? "rotate-180" : ""
									}`}
								/>
							</div>
							<ul className={`submenu ${submenusVisible[menu.key] ? "open" : ""}`}>
								{
									menu.children?.map((child) => {
										if (child.route === "/role" && !isSuperAdmin) {
											return null
										}
										
										if (child.route === "/approval-flow" && !isSuperAdmin) {
											return null
										}

										if (!isIT 
												&& (
													child.route == '/form-it/statistical' || child.route == '/form-it/all-form-it' || child.route == '/form-it/list-item-wait-form-purchase'
												))
										{
											return null
										}

										if (!isPurchase 
												&& (
													child.route == '/purchase/statistical' || child.route == '/purchase/list-item-wait-quote'
												))
										{
											return null
										}

										// if (child.route === "/purchase/statistical" && !isPurchase) {
										// 	return null
										// }

										// if (child.route === '/management-time-keeping') {
										// 	if (!havePermissionMngTimeKeeping) {
										// 		return null;
										// 	}

										// 	if (!hasHRRole && !havePermissionMngTimeKeeping) {
										// 		return null
										// 	}
										// }

										const isActive = currentPath === child.route;
										
										return (
											<li key={child.route} className={`text-blue-900 ${isActive ? "bg-[#e3e3e3]" : ""}`}>
												<Link
													to={child.route}
													onClick={() => setVisibleSubmenuByPath(child.route, child.parentKey ?? menu.key)}
													className={`dark:hover:text-black sidebar-link hover:bg-[#e3e3e3] flex items-center ${
														isActive ? "dark:text-black" : "dark:text-white"
													}`}
												>
													<Dot />
													<span>
														{t(child.label)}
														{countWaitApprovalSidebar?.totalWaitApproval > 0 && child.route == "/approval/pending-approval" && (
															<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
																({countWaitApprovalSidebar?.totalWaitApproval})
															</span>
														)}
														{countWaitApprovalSidebar?.totalAssigned > 0 && child.route == "/approval/assigned-tasks" && (
															<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
																({countWaitApprovalSidebar?.totalAssigned})
															</span>
														)}
														{countWaitApprovalSidebar?.countFormITWaitFormPurchase > 0 && child.route == "/form-it/list-item-wait-form-purchase" && (
															<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
																({countWaitApprovalSidebar?.countFormITWaitFormPurchase})
															</span>
														)}
														{countWaitApprovalSidebar?.countWaitConfirm > 0 && child.route == "/approval/wait-confirm" && (
															<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
																({countWaitApprovalSidebar?.countWaitConfirm})
															</span>
														)}
														{countWaitApprovalSidebar?.countWaitQuote > 0 && child.route == "/approval/wait-quote" && (
															<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
																({countWaitApprovalSidebar?.countWaitQuote})
															</span>
														)}
														{countWaitApprovalSidebar?.countWaitResponseQuote > 0 && child.route == "/purchase/list-item-wait-quote" && (
															<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
																({countWaitApprovalSidebar?.countWaitResponseQuote})
															</span>
														)}
														{countWaitApprovalSidebar?.countVoteIsOpen > 0 && child.route == "/vote" && (
															<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
																({countWaitApprovalSidebar?.countVoteIsOpen})
															</span>
														)}
													</span>
												</Link>
											</li>
										);
									})
								}
							</ul>
						</div>
					);
				})}
			</nav>
		</div>
	);
}