import { useAuthStore } from "@/store/authStore"
import { Menu, Moon, Sun } from "lucide-react"
import SelectedLanguage from "./components/SelectLanguage"
import { useSidebarStore } from "@/store/sidebarStore"

import "./style.css"
import AvatarDropdown from "./components/AvatarDropdown"
import { useEffect, useState } from "react"

export default function Header() {
    const { user } = useAuthStore();
    const handleToggleSidebar = useSidebarStore((s) => s.toggleSidebar);

    const [darkMode, setDarkMode] = useState(false);

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

    const handDarkMode = () => {
        setDarkMode(!darkMode)
    }

    return (
        <header className="header bg-white dark:bg-[#1b1b1f]">
            <button className="toggle-btn" onClick={handleToggleSidebar}>
                <Menu className="dark:text-white"/>
            </button>
            <div style={{ height: "40px"}} className='flex items-center'>

                <div className="mr-3">
                    { darkMode ? 
                        <Moon className="dark:text-white hover:cursor-pointer" onClick={handDarkMode}/>
                         : <Sun className="dark:text-white hover:cursor-pointer" onClick={handDarkMode}/>}
                </div>

                <SelectedLanguage/>

                <div className='text-black mr-4 font-bold text-sm dark:text-white'>
                    { user?.name ?? "undefined" }
                </div>

                <div className="pr-7 flex items-center">
                    <AvatarDropdown/>
                </div>
            </div>
        </header>
    );
}