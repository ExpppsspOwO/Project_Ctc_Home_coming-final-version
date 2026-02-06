// src/components/SessionExpiredToast.jsx
import React, { useEffect } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';

const SessionExpiredToast = ({ onRedirect }) => {
  
  // ✅ เพิ่ม: สั่งให้ดีดหนีอัตโนมัติเมื่อครบ 10 วินาที (ตาม Animation bar)
  useEffect(() => {
    const timer = setTimeout(() => {
        onRedirect();
    }, 10000); // 10000ms = 10 วินาที

    return () => clearTimeout(timer);
  }, [onRedirect]);

  return (
    <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-l-8 border-red-500 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-3xl p-8 pr-14 min-w-[450px] max-w-lg relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-2 bg-red-100 dark:bg-red-900 w-full">
           <div className="h-full bg-red-500 transition-all ease-linear" style={{ width: '100%', animation: 'countdown 10s linear forwards' }} />
        </div>
        <style>{`@keyframes countdown { from { width: 100%; } to { width: 0%; } }`}</style>
        
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border-[6px] border-red-100 dark:border-red-900/50 shadow-inner">
             <AlertCircle size={40} />
          </div>
          <div>
            <h4 className="font-black text-2xl text-slate-800 dark:text-white mb-2">หมดเวลาใช้งาน!</h4>
            <p className="text-lg text-slate-500 dark:text-slate-300 leading-relaxed">Session ของคุณหมดอายุแล้ว<br/>กรุณาเข้าสู่ระบบใหม่อีกครั้ง</p>
            <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-full w-fit">
               <Loader2 size={20} className="animate-spin" /> 
               <span>กำลังพากลับไปหน้า Login...</span>
            </div>
          </div>
        </div>
        <button onClick={onRedirect} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X size={28} />
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredToast;