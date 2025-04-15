import { ReactNode } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import BreadCrumbComponent from "../components/BreadCrumbComponent/BreadCrumbComponent";

import "../App.css"

type Props = {
    children: ReactNode;
};

export default function MainLayout({ children }: Props) {	
	return (
		<div className="app-container">
			<Sidebar />
			<div className="main">
				<Header/>
				<BreadCrumbComponent/>
				<div className="main-content">
					{children}
				</div>
			</div>
		</div>
	);
}