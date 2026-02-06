// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
// ⚠️ อย่าลืม Import useToast จากที่ที่คุณสร้าง Context ไว้ (เช่นใน App.jsx หรือ Context file)
import { useToast } from '../context/ToastContext'; 

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { addToast } = useToast(); // เรียกใช้ Toast
  const token = localStorage.getItem('token');

  // --- กรณีที่ 1: ไม่มี Token (ไม่ได้ Login) ---
  if (!token) {
    // ใช้ component นี้เพื่อยิง Side Effect (Toast) ก่อน redirect
    return <TokenCheckAndRedirect addToast={addToast} />;
  }

  try {
    // แกะ Token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const user = JSON.parse(jsonPayload).user;

    // --- กรณีที่ 2: Role ไม่ถูกต้อง ---
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // ✅ แก้ไข: ให้ Redirect ไป URL ใหม่ แทนการ render ตรงนี้
      // Layout จะได้รู้ว่าไม่ใช่หน้า dashboard แล้ว
      return <Navigate to="/unauthorized" replace />;
    }

    return children;

  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/auth" replace />;
  }
};

// สร้าง Component เล็กๆ ช่วยยิง Toast เพื่อป้องกัน error เรื่อง render cycle
const TokenCheckAndRedirect = ({ addToast }) => {
    useEffect(() => {
        addToast('กรุณาเข้าสู่ระบบก่อนใช้งาน 🔒', 'warning');
    }, [addToast]);

    return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;