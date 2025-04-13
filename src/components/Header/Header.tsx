import { Menu } from "lucide-react"

import "./style.css"
import AvatarDropdown from "./components/AvatarDropdown"

type HeaderProps = {
    handleToggleSidebar: () => void
}

export default function Header({handleToggleSidebar}: HeaderProps) {
    return (
        <header className="header">
            <button className="toggle-btn" onClick={handleToggleSidebar}>
                <Menu/>
            </button>
            <div style={{ height: "45px"}} className='flex items-center'>
                <div className='text-black mr-4'>
                    Hi superadmin
                </div>

                <div className="pr-5">
                    <AvatarDropdown/>
                </div>
            </div>
        </header>
    );
}