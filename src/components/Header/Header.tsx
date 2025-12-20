import { useAuthStore } from "@/store/authStore"
import { Menu } from "lucide-react"
import { useSidebarStore } from "@/store/sidebarStore"
import { useEffect, useState } from "react"
import { useAppStore } from "@/store/appStore"
import SelectedLanguage from "./components/SelectLanguage"
import AvatarDropdown from "./components/AvatarDropdown"
import "./style.css"
import useHasRole from "@/hooks/useHasRole"
import { RoleEnum } from "@/lib"

export default function Header() {
    const { user } = useAuthStore();
    const [darkMode, setDarkMode] = useState(false);
    const numberWait = useAppStore((state) => state.numberLeaveWaitApproval);
    const handleToggleSidebar = useSidebarStore((s) => s.toggleSidebar);

    const isSuperAdmin = useHasRole([RoleEnum.SUPERADMIN])

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        } else {
            setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);
    
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // const handDarkMode = () => {
    //     setDarkMode(!darkMode)
    // }

    return (
        <header className="header bg-white dark:bg-[#1b1b1f]">
            <button className="toggle-btn relative" onClick={handleToggleSidebar}>
                <Menu className="dark:text-white"/>
                {
                    numberWait > 0 ? <span className="absolute w-[15px] h-[15px] bg-red-500 rounded-[50%] text-[11px] text-white top-[0px] left-[15px]"></span> : ""
                }
            </button>
            <div style={{ height: "40px"}} className='flex items-center'>

                {/* <div className="mr-3 display-none">
                    { darkMode ? 
                        <Moon className="dark:text-white hover:cursor-pointer" onClick={handDarkMode}/>
                         : <Sun className="dark:text-white hover:cursor-pointer" onClick={handDarkMode}/>}
                </div> */}

                <SelectedLanguage/>

                <div className='text-black mr-4 font-bold text-sm dark:text-white'>
                    {
                        user?.userCode == '0' && isSuperAdmin ? '0 - Superadmin' :
                        user?.userName == null || user?.userName == '' ? '....' : user?.userCode == '0' ? '0 - superadmin' : `${user?.userCode} - ${user?.userName}`
                    }
                </div>

                <div className="flex items-center avatar-dropdown">
                    <AvatarDropdown/>
                </div>
            </div>
        </header>
    );
}