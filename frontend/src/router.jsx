// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom'; // ✅ เพิ่ม Navigate
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout'; // ✅ 1. Import Layout ใหม่

// Pages ฝั่ง User
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';
import MyBookings from './pages/MyBookings';
import SouvenirShop from './pages/SouvenirShop';
import MyOrders from './pages/MyOrders';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import ContactLine from './pages/ContactLine';

// ✅ 2. Import หน้าต่างๆ ของ Admin มาไว้ตรงนี้โดยตรง (ไม่ต้องผ่าน AdminDashboard แล้ว)
import BookingManager from './components/admin/BookingManager';
import SouvenirManagement from './components/admin/SouvenirManagement';
import ZoneGenerator from './components/admin/ZoneGenerator';
import UserManagement from './components/admin/UserManagement';
import SiteSettings from './components/admin/SiteSettings';
import SouvenirOrderManager from './components/admin/SouvenirOrderManager';
import TableManager from './components/admin/TableManager'
import { Form } from 'lucide-react';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />, 
    children: [
      { index: true, element: <Index /> },
      { path: 'unauthorized', element: <Unauthorized /> },
      { path: 'MyBookings', element: <MyBookings /> },
      { path: 'SouvenirShop', element: <SouvenirShop /> },
      { path: 'my-orders', element: <MyOrders /> },
      { path: 'profile', element: <Profile /> },
      { path: 'Contact-line', element: <ContactLine /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: 'auth', element: <AuthPage /> },

  // ✅ 3. โซน Dashboard ปรับใหม่ (Nested Routes)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'officer']}>
        <AdminLayout /> {/* 👈 ใช้ Layout นี้เป็นโครงสร้างหลัก */}
      </ProtectedRoute>
    ),
    children: [
      // ถ้าเข้า /dashboard เฉยๆ ให้เด้งไปหน้า bookings ก่อนเลย
      { index: true, element: <Navigate to="bookings" replace /> },
      
      // กำหนด URL ย่อยๆ ตามที่ตั้งไว้ใน AdminLayout
      { path: 'bookings', element: <BookingManager /> },   // url: /dashboard/bookings
      { path: 'zones', element: <ZoneGenerator /> },       // url: /dashboard/zones
      { path: 'souvenirs', element: <SouvenirManagement /> }, // url: /dashboard/souvenirs
      { path: 'orders', element: <SouvenirOrderManager /> },  // url: /dashboard/orders
      { path: 'users', element: <UserManagement /> },      // url: /dashboard/users
      { path: 'TableManager', element: <TableManager /> },
      { path: 'settings', element: <SiteSettings /> },     // url: /dashboard/settings
    ]
  },
]);