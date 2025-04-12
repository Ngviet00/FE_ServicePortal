import { Routes, Route, useLocation  } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import UserList from './pages/UserList';
import UserCreate from './pages/UserCreate';
import UserEdit from './pages/UserEdit';
import './App.css'

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';


import RedirectIfAuthenticated from "./routes/IsAuthenticated";
import PrivateRoute from "./routes/PrivateRoute";
// import AppRoutes from './routes';

function App() {

	const location = useLocation();
	const isAuthRoute = location.pathname === "/login";
  
  return (
	// <AppRoutes />
	<>
      {isAuthRoute ? (
        <AuthLayout>
          <Routes>
			<Route
				path="/login"
				element={
					<RedirectIfAuthenticated>
					<LoginPage />
					</RedirectIfAuthenticated>
				}
				/>
          </Routes>
        </AuthLayout>
      ) : (
		<PrivateRoute>
			<MainLayout>
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
			</MainLayout>
		</PrivateRoute>
        
      )}
    </>
  )
}

export default App
