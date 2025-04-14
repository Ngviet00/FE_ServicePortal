import { ReactNode, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import "../App.css"

import BreadCrumb from "@/components/Breadcrumb/Breadcrumb";

type Props = {
    children: ReactNode;
};

export default function MainLayout({ children }: Props) {
	const [sidebarVisible, setSidebarVisible] = useState(true);
	const [submenusVisible, setSubmenusVisible] = useState<{ user: boolean; category: boolean; admin: boolean }>({
		user: false,
		category: false,
		admin: false,
	});

	const toggleSubmenu = (menu: "user" | "category" | "admin") => {
		setSubmenusVisible((prev) => {
			if (prev[menu]) {
				return { user: false, category: false, admin: false };
			}
			return {
				user: menu === "user",
				category: menu === "category",
				admin: menu === "admin",
			};
		});
	};

	const handleToggleSidebar = () => {
		const nextVisible = !sidebarVisible;
		setSidebarVisible(nextVisible);
		if (!nextVisible) {
			setSubmenusVisible({ user: false, category: false, admin: false });
		}
	};

	return (
		<div className="app-container">
			<Sidebar
				config={{
					visible: sidebarVisible,
					submenus: submenusVisible,
					toggleSubmenu,
				}}
			/>

			<div className="main">
				<Header handleToggleSidebar={handleToggleSidebar} />

				<BreadCrumb/>

				<div className="main-content">
					{children}
				</div>
			</div>
		</div>
	);
}