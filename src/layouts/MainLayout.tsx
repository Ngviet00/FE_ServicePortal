import { ReactNode } from "react";
import { useSidebarStore } from "@/store/sidebarStore";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import BreadCrumbComponent from "../components/BreadCrumbComponent/BreadCrumbComponent";

import '../components/RootComponent/App.css'

type Props = {
    children: ReactNode;
};

export default function MainLayout({ children }: Props) {
    const isOpen = useSidebarStore((s) => s.isOpen);
    const closeSidebar = useSidebarStore((s) => s.closeSidebar)
	
	return (
		<div className="app-container">
			<Sidebar />

            <div className={`overlay fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out 
                ${isOpen ? "opacity-50 visible" : "opacity-0 invisible"}`} onClick={closeSidebar}></div>

			<div className="main dark:bg-[#1b1b1f]">
				<Header/>
                <div className="wrap-main-layout mt-2 mx-2 min-h-[95%]">
                    <BreadCrumbComponent/>
                    <div className="main-content mt-2 bg-white dark:bg-[#454545] min-h-[90%]">
                        {children}
                    </div>
                </div>
			</div>
		</div>
	);
}