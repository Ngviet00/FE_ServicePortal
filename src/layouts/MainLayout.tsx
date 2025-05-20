import { ReactNode, useEffect } from "react";
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
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

	useEffect(() => {
        let connection: HubConnection | null = null;

        const startConnection = async () => {
            connection = new HubConnectionBuilder().withUrl(import.meta.env.VITE_URL_HUB).build();

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