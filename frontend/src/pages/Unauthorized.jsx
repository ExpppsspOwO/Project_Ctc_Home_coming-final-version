// src/pages/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100 dark:border-slate-800">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Access Denied!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้ <br/>
          หน้านี้สำหรับเจ้าหน้าที่ (Admin) เท่านั้นครับ 👮‍♂️
        </p>

        <button 
          onClick={() => navigate('/')}
          className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-slate-600 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;