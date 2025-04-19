import { useAuthStore } from "@/store/authStore"
import { Menu } from "lucide-react"
import SelectedLanguage from "./components/SelectLanguage"
import { useSidebarStore } from "@/store/sidebarStore"

import "./style.css"
import AvatarDropdown from "./components/AvatarDropdown"

export default function Header() {
    const { user } = useAuthStore();
    const handleToggleSidebar = useSidebarStore((s) => s.toggleSidebar);

    return (
        <header className="header">
            <button className="toggle-btn" onClick={handleToggleSidebar}>
                <Menu/>
            </button>
            <div style={{ height: "40px"}} className='flex items-center'>
                <SelectedLanguage/>
                <div className='text-black mr-4 font-bold text-sm'>
                    { user?.name ?? "undefined" }
                </div>

                <div className="pr-7 flex items-center">
                    <AvatarDropdown/>
                </div>
            </div>
        </header>
    );
}