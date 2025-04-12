// Sidebar.tsx
import React, { useState } from 'react';
import './Sidebar.css';  // Import file CSS cho Sidebar

type SubmenusVisible = {
  user: boolean;
  category: boolean;
};

const Sidebar = () => {
  const [submenusVisible, setSubmenusVisible] = useState<SubmenusVisible>({
    user: false,
    category: false,
  });

  const toggleSubmenu = (menu: 'user' | 'category') => {
    setSubmenusVisible((prev) => {
      const newSubmenus = { ...prev, user: false, category: false };
      newSubmenus[menu] = !newSubmenus[menu];
      return newSubmenus;
    });
  };

  return (
    <div className="sidebar">
      <ul>
        <li>
          <button onClick={() => toggleSubmenu('user')}>Quản lý User</button>
          {submenusVisible.user && (
            <ul>
              <li>Thêm User</li>
              <li>Sửa User</li>
              <li>Danh sách User</li>
            </ul>
          )}
        </li>
        <li>
          <button onClick={() => toggleSubmenu('category')}>Quản lý Danh mục</button>
          {submenusVisible.category && (
            <ul>
              <li>Thêm Danh mục</li>
              <li>Sửa Danh mục</li>
              <li>Danh sách Danh mục</li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;