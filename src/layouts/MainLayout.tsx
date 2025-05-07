import { ReactNode } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import BreadCrumbComponent from "../components/BreadCrumbComponent/BreadCrumbComponent";

import '../components/RootComponent/App.css'
import { useAuthStore } from "@/store/authStore";
import userApi from "@/api/userApi";
import { useQuery } from "@tanstack/react-query";

type Props = {
    children: ReactNode;
};

export default function MainLayout({ children }: Props) {
	const setUser = useAuthStore((state) => state.setUser);

	// useQuery({
	// 	queryKey: ['get-me'],
	// 	queryFn: async () => {
	// 		const res = await userApi.getMe();
    //         setUser(res.data.data);
	// 		return res.data.data;
	// 	},
	// });
	
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