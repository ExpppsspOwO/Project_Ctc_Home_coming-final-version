// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-transparent">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-slate-700 mb-4 transition-colors">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-2 transition-colors">ไม่พบหน้าที่คุณต้องการ</h2>
      <p className="text-gray-500 dark:text-slate-400 mb-6 transition-colors">หน้านี้อาจถูกลบหรือคุณพิมพ์ URL ผิด</p>
      
      <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">
        กลับไปหน้าแรก
      </Link>
    </div>
  );
};

export default NotFound;