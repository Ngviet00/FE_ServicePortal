import { Link } from "react-router-dom";

import "./style.css"

import { SidebarConfig } from "./TypeSidebar";

type SidebarProps = {
    config: SidebarConfig
}

export default function Sidebar({ config }: SidebarProps) {

	const { visible, submenus, toggleSubmenu } = config

    return (
		<div className={`sidebar ${visible ? '' : 'collapsed'}`}>
			<div>
				<Link to="/">
					<img src="/logo.png" alt="" />
				</Link>
			</div>
			<nav>
				<Link to="/" className="sidebar-link">Dashboard</Link>
				<Link to="/about" className="sidebar-link">About</Link>

				<div className="menu-group">
					<div className="menu-title" onClick={() => toggleSubmenu('user')}>
						<span>Quản lý User</span>
						<span className={`submenu-toggle ${submenus.user ? 'open' : ''}`}>↓</span>
					</div>
					<ul className={`submenu ${submenus.user ? 'open' : ''}`}>
						<li><Link to="/user/create" className="sidebar-link">Create</Link></li>
						<li><Link to="/user/edit" className="sidebar-link">Edit</Link></li>
						<li><Link to="/user/list" className="sidebar-link">List</Link></li>
					</ul>
				</div>

				<div className="menu-group">
					<div className="menu-title" onClick={() => toggleSubmenu('category')}>
						<span>Quản lý Danh Mục</span>
						<span className={`submenu-toggle ${submenus.category ? 'open' : ''}`}>↓</span>
					</div>
					<ul className={`submenu ${submenus.category ? 'open' : ''}`}>
						<li><Link to="/category/create" className="sidebar-link">Create</Link></li>
						<li><Link to="/category/edit" className="sidebar-link">Edit</Link></li>
						<li><Link to="/category/list" className="sidebar-link">List</Link></li>
					</ul>
				</div>
			</nav>
      </div>
	);
}