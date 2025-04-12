import { useState } from 'react'
import { Routes, Route, Link  } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import UserList from './pages/UserList';
import UserCreate from './pages/UserCreate';
import UserEdit from './pages/UserEdit';
import './App.css'

// import Sidebar from './Sidebar';

function App() {

	const [sidebarVisible, setSidebarVisible] = useState(true);
	const [submenusVisible, setSubmenusVisible] = useState<{ user: boolean; category: boolean }>({
		user: false,
		category: false,
	  });
	
	  const toggleSubmenu = (menu: 'user' | 'category') => {
		setSubmenusVisible((prev) => {
		  // Nếu submenu đó đang mở thì đóng lại (reset hết)
		  if (prev[menu]) {
			return {
			  user: false,
			  category: false,
			};
		  }
	  
		  // Nếu submenu đó đang đóng thì mở nó, đồng thời đóng những cái khác
		  return {
			user: menu === 'user',
			category: menu === 'category',
		  };
		});
	  };

	  const handleToggleSidebar = () => {
		const nextVisible = !sidebarVisible;
		setSidebarVisible(nextVisible);
	
		// Nếu sidebar bị ẩn đi thì đóng tất cả các submenu
		if (!nextVisible) {
		  setSubmenusVisible({ user: false, category: false });
		}
	  };
  
  return (
	<div className="app-container">
      <div className={`sidebar ${sidebarVisible ? '' : 'collapsed'}`}>
        <h2>Sidebar</h2>
        <nav>
          <Link to="/" className="sidebar-link">Home</Link>
          <Link to="/about" className="sidebar-link">About</Link>

          {/* Menu Quản lý User */}
          <div className="menu-group">
            <div className="menu-title" onClick={() => toggleSubmenu('user')}>
              <span>Quản lý User</span>
              <span className={`submenu-toggle ${submenusVisible.user ? 'open' : ''}`}>↓</span>
            </div>
            <ul className={`submenu ${submenusVisible.user ? 'open' : ''}`}>
              <li><Link to="/user/create" className="sidebar-link">Create</Link></li>
              <li><Link to="/user/edit" className="sidebar-link">Edit</Link></li>
              <li><Link to="/user/list" className="sidebar-link">List</Link></li>
            </ul>
          </div>

          {/* Menu Quản lý Danh Mục */}
          <div className="menu-group">
            <div className="menu-title" onClick={() => toggleSubmenu('category')}>
              <span>Quản lý Danh Mục</span>
              <span className={`submenu-toggle ${submenusVisible.category ? 'open' : ''}`}>↓</span>
            </div>
            <ul className={`submenu ${submenusVisible.category ? 'open' : ''}`}>
              <li><Link to="/category/create" className="sidebar-link">Create</Link></li>
              <li><Link to="/category/edit" className="sidebar-link">Edit</Link></li>
              <li><Link to="/category/list" className="sidebar-link">List</Link></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="main">
        <header className="header">
          <button className="toggle-btn" onClick={handleToggleSidebar}>
            ☰
          </button>
          <h1>Main Content</h1>
        </header>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/user/create" element={<UserCreate />} />
            <Route path="/user/edit" element={<UserEdit />} />
            <Route path="/user/list" element={<UserList />} />
            <Route path="/category/create" element={<UserCreate />} />
            <Route path="/category/edit" element={<UserCreate />} />
            <Route path="/category/list" element={<UserCreate />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
