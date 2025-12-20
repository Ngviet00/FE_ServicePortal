/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Dot, X } from "lucide-react";
import { useSidebarStore, SIDEBAR_MENUS, SidebarMenuItem } from "@/store/sidebarStore";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { RoleEnum, UnitEnum } from "@/lib";
import useIsReponsive from "@/hooks/IsResponsive";
import useHasRole from "@/hooks/useHasRole";
import "./style.css"
import approvalApi from "@/api/approvalApi";

export default function Sidebar() {
	const location = useLocation();
	const currentPath = location.pathname;

	const closeSidebar = useSidebarStore((s) => s.closeSidebar);
	const { isOpen, setVisibleSubmenuByPath } = useSidebarStore();

	const { user } = useAuthStore()

	const isMobile = useIsReponsive()
	const isOrgUnitIdAvailable = user !== null && user !== undefined && user.orgPositionId !== null && user.orgPositionId !== undefined;

	const { data: countWaitApprovalSidebar } = useQuery({
		queryKey: ["count-wait-approval-sidebar", user?.userCode],
		queryFn: async () => {
			const res = await approvalApi.CountWaitApprovalAndAssignedInSidebar({
				DepartmentId: user?.departmentId,
				UserCode: user?.userCode,	
				OrgPositionId: user?.orgPositionId ?? -9999,
			});
			return res.data.data;
		},
		enabled: isOrgUnitIdAvailable
	});

	useEffect(() => {
		setVisibleSubmenuByPath(currentPath);
		if (isMobile) closeSidebar();
	}, [closeSidebar, currentPath, isMobile, setVisibleSubmenuByPath]);

	const sidebarMenus = useMemo(() => SIDEBAR_MENUS, []);

	return (
		<div className={`sidebar ${isOpen ? "collapsed" : ""} bg-white dark:bg-[#1b1b1f] w-[300px]`}>
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
				{sidebarMenus.map((menu) => (
					<SidebarItem 
						key={menu.key}
						menu={menu}
						currentPath={currentPath}
						countData={countWaitApprovalSidebar}
					/>
				))}
			</nav>
		</div>
	);
}

interface SidebarItemProps {
	menu: SidebarMenuItem;
	currentPath: string;
	level?: number;
	countData?: any;
}

export const SidebarItem = React.memo(function SidebarItem({ menu, currentPath, level = 0, countData }: SidebarItemProps) {
	const { t } = useTranslation();
	const { user } = useAuthStore()
	const { submenusVisible, toggleSubmenu, setVisibleSubmenuByPath } = useSidebarStore();

	const isOpen = submenusVisible[menu.key];

	const isSuperAdmin = useHasRole([RoleEnum.SUPERADMIN])
	const isHR = useHasRole([RoleEnum.HR])
	const isUnion = useHasRole([RoleEnum.UNION])
	const isITAdmin = useHasRole([RoleEnum.IT_ADMIN])
	const isITUser = useHasRole([RoleEnum.IT_USER])
	const isPurchaseAdmin = useHasRole([RoleEnum.PURCHASE_ADMIN])
	const isPurchaseUser = useHasRole([RoleEnum.PURCHASE_USER])
	const isSAP = useHasRole([RoleEnum.SAP])
	const isApproval = useHasRole([RoleEnum.APPROVAL])

	const hasChildren = menu.children && menu.children.length > 0;
	
	const handleToggle = useCallback(() => {
        toggleSubmenu(menu.key);
    }, [menu.key, toggleSubmenu]);

	const childrenMemo = useMemo(() => menu.children || [], [menu.children]);

	const parentBadge = useMemo(() => {
        if (!countData) return null;

        switch (menu.key) {
            case "approval":
				return (countData?.countByUser?.pending ?? 0) + (countData?.countByUser?.assigned ?? 0)
            case "IT":
				return null;
                // Bỏ dấu ngoặc nhọn thừa
                // const itTotal = countData.countFormITWaitFormPurchase || 0; 
                // return itTotal > 0 ? itTotal : null;
            case "Purchase":
				return null
                // Bỏ dấu ngoặc nhọn thừa
                // const purchaseTotal = (countData.countWaitResponseQuote || 0);
                // return purchaseTotal > 0 ? purchaseTotal : null;
            default:
                return null;
        }
    }, [countData, menu.key]);

	const renderChildren = useCallback(() => {
		if (!hasChildren) return null;

		return (
			<div className={`submenu ${isOpen ? "open" : ""}`}>
				{childrenMemo!.map((child) => {
					const isActive = currentPath === child.route;

					if (child.children && child.children.length > 0) {
						return <SidebarItem key={child.key} menu={child} currentPath={currentPath} level={level + 1} countData={countData} />;
					}

					// 1. Logic Admin Routes
                    if (child.route === "/role" && !isSuperAdmin) return null;
                    if (child.route === "/approval-flow" && !isSuperAdmin) return null;

					// 2. Logic IT Admin Routes
                    const itAdminOnlyRoutes = ['/form-it/statistical', '/form-it/all-form-it', '/form-it/list-item-wait-form-purchase'];
                    if (itAdminOnlyRoutes.includes(child.route ?? '') && !isITAdmin) return null;
					
					// 3. Logic Purchase Admin Routes
                    const purchaseAdminOnlyRoutes = ['/purchase/statistical', '/purchase/all-form-purchase', '/purchase/list-item-wait-quote'];
                    if (purchaseAdminOnlyRoutes.includes(child.route ?? '') && !isPurchaseAdmin) return null;

					// 4. Logic SAP Routes
                    if (child.route === '/sap/statistics' && !isITAdmin) return null;

					const canAccessSapConfig = user?.unitId === UnitEnum.GM || user?.unitId === UnitEnum.Manager || isSuperAdmin;
                    if (child.route === '/sap/config' && !canAccessSapConfig) return null;

					//union
					if (child.route === '/union/member' && !isUnion) return null;

					let badge = null;
                    if (countData) {
                        switch (child.route) {
                            case "/approval/pending-approval":
								badge = countData?.countByUser?.pending ?? 0 
								break;
                            case "/approval/assigned-tasks":
								badge = countData?.countByUser?.assigned ?? 0
								break;
                            case "/form-it/list-item-wait-form-purchase":
                                if (countData.countFormITWaitFormPurchase > 0) badge = countData.countFormITWaitFormPurchase; break;
                            default: break;
                        }
                    }

					return (
						<div key={child.key} className={`text-blue-900 text-sm ${isActive ? "bg-[#e3e3e3]" : ""}`}>
							<Link
								to={child.route ?? ""}
								onClick={() => setVisibleSubmenuByPath(child.route ?? "", menu.key)}
								className={`dark:hover:text-black sidebar-link hover:bg-[#e3e3e3] flex items-center ${isActive ? "dark:text-black" : "dark:text-white"}`}
							>
								<Dot className={`${level != 0 ? `ml-${level * 8}` : `ml-[8px]`}`} />

								<span className={`${level != 0 ? `ml-${level*2}` : `ml-2`} flex-1`}>
									{t(child.label)}
									{badge > 0 && <span className="text-red-500 ml-1 font-bold">({badge})</span>}
								</span>
							</Link>
						</div>
					);
				})}
			</div>
		);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		hasChildren, isOpen, childrenMemo, currentPath, level, setVisibleSubmenuByPath, t, 
        isSuperAdmin, isITAdmin, isPurchaseAdmin, user?.unitId, countData
	]);

	if (menu.key === "home") {
		const isActive = currentPath === menu.route;
		return (
			<div className="my-2" key={menu.key}>
				<a
					href="/"
					className={`sidebar-link flex items-center hover:bg-[#e3e3e3] text-blue-900 dark:hover:bg-[#e3e3e3] dark:hover:text-black ${
						isActive ? "bg-[#e3e3e3] dark:text-black" : "dark:text-white"
					}`}
				>
					{menu.icon && <menu.icon size={20} />}
					<span className="pl-2">{t(menu.label)}</span>
				</a>
			</div>
		);
	}

	if (menu.key == "Admin" && !isSuperAdmin) return null;
	if (menu.key == "HR" && !isHR) return null;
	if (menu.key == "MemoNotification" && !isITAdmin && !isHR && !isUnion) return null;
	if (menu.key == "IT" && !isITAdmin && !isITUser) return null;
	if (menu.key == "Purchase" && !isPurchaseAdmin && !isPurchaseUser) return null;
	if (menu.key == "SAP" && !isSAP) return null;
	if (menu.key == "approval" && !isApproval) return null;

	return (
		<div className={level == 0 ? 'my-2' : ''} key={menu.key}>
			<div
				onClick={handleToggle}
				className={`menu-title hover:bg-[#e3e3e3] flex items-center cursor-pointer ${level != 0 ? 'text-sm mb-0': ''} text-blue-900 dark:text-white dark:hover:text-black`}
			>
				{menu.icon && <menu.icon size={20} />}
				{
					level != 0 ? <Dot className={`ml-${level*2}`}/> : ''
				}
				<span className={`${level != 0 ? `ml-${level*2}` : `ml-2`} flex-1`}>
					{t(menu.label)}
					{parentBadge !== null && parentBadge > 0 && (
						<span className="text-red-500 font-bold" style={{paddingLeft: '5px'}}>
							({parentBadge})
						</span>
					)}
				</span>
				
				{hasChildren && <ChevronDown size={18} className={`submenu-toggle transition-transform ${isOpen ? "rotate-180" : ""}`} />}
			</div>
			{renderChildren()}
		</div>
	);
});