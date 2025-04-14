import { Link } from "react-router-dom";

import "./style.css"

import { SidebarConfig } from "./TypeSidebar";
import { ChevronDown, Dot, House, LockKeyhole, Ticket, Users } from "lucide-react";

type SidebarProps = {
    config: SidebarConfig
}

export default function Sidebar({ config }: SidebarProps) {

	const { visible, submenus, toggleSubmenu } = config

    return (
		<div className={`sidebar ${visible ? '' : 'collapsed'}`}>
			<div>
				<Link to="/">
					<img src="/logo.png" alt="" style={{ height: '80px'}}/>
				</Link>
			</div>

			<hr className="mt-1" />

			<nav className="pt-2">
				<div>
					<Link to="/" className="sidebar-link flex items-center text-blue-900">
						<House size={20}/>
						<span className="pl-5 text-base">
							Trang chủ
						</span>
					</Link>
				</div>

				<div className="menu-group">
					<div className="menu-title flex items-center cursor-pointer text-blue-900" onClick={() => toggleSubmenu('admin')}>
						<LockKeyhole size={20} />
						<span className="pl-5 flex-1">Admin</span>
						<ChevronDown size={18} className={`submenu-toggle transition-transform ${submenus.admin ? 'rotate-180' : ''}`} />
					</div>	
					<ul className={`submenu ${submenus.admin ? 'open' : ''}`}>
						<li className="text-blue-900">
							<Link to="/user/create" className="sidebar-link">
								<Dot/>
								<span className="pl-8">Create</span>
							</Link>
						</li>
						<li className="text-blue-900">
							<Link to="/user/edit" className="sidebar-link">
								<Dot/>
								<span className="pl-8">Edit</span>
							</Link>
						</li>
						<li className="text-blue-900">
							<Link to="/user/list" className="sidebar-link">
								<Dot/>
								<span className="pl-8">List</span>
							</Link>
						</li>
					</ul>
				</div>

				<div className="menu-group">
					<div className="menu-title flex items-center cursor-pointer text-blue-900" onClick={() => toggleSubmenu('user')}>
						<Users size={20} />
						<span className="pl-5 flex-1">User</span>
						<ChevronDown size={18} className={`submenu-toggle transition-transform ${submenus.user ? 'rotate-180' : ''}`} />
					</div>	
					<ul className={`submenu ${submenus.user ? 'open' : ''}`}>
						<li className="text-blue-900">
							<Link to="/user/create" className="sidebar-link">
								<Dot/>
								<span className="pl-8">Create</span>
							</Link>
						</li>
						<li className="text-blue-900">
							<Link to="/user/edit" className="sidebar-link">
								<Dot/>
								<span className="pl-8">Edit</span>
							</Link>
						</li>
						<li className="text-blue-900">
							<Link to="/user/list" className="sidebar-link">
								<Dot/>
								<span className="pl-8">List</span>
							</Link>
						</li>
					</ul>
				</div>

				<div className="menu-group">
					<div className="menu-title flex items-center cursor-pointer text-blue-900" onClick={() => toggleSubmenu('user')}>
						<Ticket size={20} />
						<span className="pl-5 flex-1">Nghỉ phép</span>
						<ChevronDown size={18} className={`submenu-toggle transition-transform ${submenus.user ? 'rotate-180' : ''}`} />
					</div>	
					<ul className={`submenu ${submenus.user ? 'open' : ''}`}>
						<li className="text-blue-900">
							<Link to="/user/create" className="sidebar-link">
								<Dot/>
								<span className="pl-8">Xin nghỉ phép</span>
							</Link>
						</li>
						<li className="text-blue-900">
							<Link to="/user/edit" className="sidebar-link">
								<Dot/>
								<span className="pl-8">Danh sách nghỉ phép</span>
							</Link>
						</li>
					</ul>
				</div>
			</nav>
      </div>
	);
}