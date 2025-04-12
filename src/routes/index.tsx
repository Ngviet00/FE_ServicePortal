// // src/routes/index.tsx
// import { Routes, Route } from 'react-router-dom';
// import HomePage from '../pages/HomePage';
// import AboutPage from '../pages/AboutPage';
// import UserList from '../pages/UserList';
// import UserCreate from '../pages/UserCreate';
// import UserEdit from '../pages/UserEdit';
// import LoginPage from '../pages/LoginPage';

// import AuthLayout from '../layouts/AuthLayout';
// import MainLayout from '../layouts/MainLayout';

// import PrivateRoute from './PrivateRoute';
// import RedirectIfAuthenticated from './IsAuthenticated';

// export default function AppRoutes() {
//   return (
//     <Routes>
//       {/* Auth Layout */}
//       <Route
//         path="/login"
//         element={
//           <AuthLayout>
//             <RedirectIfAuthenticated>
//               <LoginPage />
//             </RedirectIfAuthenticated>
//           </AuthLayout>
//         }
//       />

//       {/* Main App Layout */}
//       <Route
//         path="/"
//         element={
//           <PrivateRoute>
//             <MainLayout/>
//           </PrivateRoute>
//         }
//       >
//         <Route index element={<HomePage />} />
//         <Route path="about" element={<AboutPage />} />
//         <Route path="user/create" element={<UserCreate />} />
//         <Route path="user/edit" element={<UserEdit />} />
//         <Route path="user/list" element={<UserList />} />
//         <Route path="category/create" element={<UserCreate />} />
//         <Route path="category/edit" element={<UserCreate />} />
//         <Route path="category/list" element={<UserCreate />} />
//       </Route>
//     </Routes>
//   );
// }
