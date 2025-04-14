import { useAuthStore } from "@/store/authStore"
import { Menu } from "lucide-react"
import AvatarDropdown from "./components/AvatarDropdown"
import SelectedLanguage from "./components/SelectLanguage"

import "./style.css"

type HeaderProps = {
    handleToggleSidebar: () => void
}

export default function Header({handleToggleSidebar}: HeaderProps) {

    const { user } = useAuthStore();

    return (
        <header className="header">
            <button className="toggle-btn" onClick={handleToggleSidebar}>
                <Menu/>
            </button>
            <div style={{ height: "40px"}} className='flex items-center'>
                <SelectedLanguage/>
                <div className='text-black mr-4 font-bold text-sm'>
                    Hi { user?.name }
                </div>

                <div className="pr-7 flex items-center">
                    <AvatarDropdown/>
                </div>
            </div>
        </header>
    );
}