import { ReactNode, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import "../App.css"

// import { Outlet } from "react-router-dom";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [submenusVisible, setSubmenusVisible] = useState<{ user: boolean; category: boolean }>({
    user: false,
    category: false,
  });

  const toggleSubmenu = (menu: "user" | "category") => {
    setSubmenusVisible((prev) => {
      if (prev[menu]) {
        return { user: false, category: false };
      }
      return {
        user: menu === "user",
        category: menu === "category",
      };
    });
  };

  const handleToggleSidebar = () => {
    const nextVisible = !sidebarVisible;
    setSidebarVisible(nextVisible);
    if (!nextVisible) {
      setSubmenusVisible({ user: false, category: false });
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        config={{
          visible: sidebarVisible,
          submenus: submenusVisible,
          toggleSubmenu,
        }}
      />

      <div className="main">
        <Header handleToggleSidebar={handleToggleSidebar} />
        <div className="main-content">{children}</div>
      </div>
    </div>
  );
}