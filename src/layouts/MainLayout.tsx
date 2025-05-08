import { ReactNode, useEffect } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import BreadCrumbComponent from "../components/BreadCrumbComponent/BreadCrumbComponent";

import '../components/RootComponent/App.css'
// import { useAuthStore } from "@/store/authStore";
// import userApi from "@/api/userApi";
// import { useQuery } from "@tanstack/react-query";

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

type Props = {
    children: ReactNode;
};

export default function MainLayout({ children }: Props) {
	// const setUser = useAuthStore((state) => state.setUser);

	// useQuery({
	// 	queryKey: ['get-me'],
	// 	queryFn: async () => {
	// 		const res = await userApi.getMe();
    //         setUser(res.data.data);
	// 		return res.data.data;
	// 	},
	// });

	useEffect(() => {
        let connection: HubConnection | null = null;

        const startConnection = async () => {
            connection = new HubConnectionBuilder()
                .withUrl(import.meta.env.VITE_URL_HUB)
                .build();

            connection.on("login_again", () => {
				localStorage.removeItem('auth-storage')
				window.location.href = "/login";
            });

            try {
                await connection.start();
                console.log('SignalR Connected');
            } catch (err) {
                console.error('Error while starting connection: ', err);
            }

            connection.onclose(async () => {
                await startConnection();
            });
        };

        startConnection();

        return () => {
            if (connection) {
                connection.stop().catch(err => console.error('Error while stopping connection:', err));
            }
        };
    }, []);
	
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