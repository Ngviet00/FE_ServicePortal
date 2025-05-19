import { useSidebarStore } from "@/store/sidebarStore";
import { useEffect, useState } from "react";

export default function useIsReponsive() {
    const [isResponsive, setIsResponsive] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsResponsive(window.innerWidth <= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isResponsive;
}

export function useSidebarResponsiveReset() {
  const closeSidebar = useSidebarStore((s) => s.closeSidebar);

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth >= 1024) {
            closeSidebar();
        }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [closeSidebar]);
}