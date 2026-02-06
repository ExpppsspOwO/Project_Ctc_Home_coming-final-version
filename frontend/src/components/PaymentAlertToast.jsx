import React from 'react';
import { CreditCard, X, ShoppingBag } from 'lucide-react';

const PaymentAlertToast = ({ onClose, onPay }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-300 mx-4 md:mx-0">
      {/* ✅ ปรับขนาดการ์ดให้ใหญ่ขึ้น (max-w-lg) และเพิ่ม Padding (p-6) */}
      <div className="bg-white dark:bg-slate-900 border-l-8 border-blue-600 shadow-2xl rounded-2xl p-6 max-w-lg w-full relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10">
        
        <div className="flex items-start gap-5">
          {/* ขยายขนาดไอคอน */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0 shadow-sm">
             <ShoppingBag size={32} strokeWidth={2} />
          </div>
          
          <div className="flex-1 pt-1">
             {/* ขยายขนาดตัวหนังสือ */}
             <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">สั่งซื้อสำเร็จ! 🎉</h4>
             <p className="text-base text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
               ระบบได้รับรายการของคุณเรียบร้อยแล้ว <br/>
               <span className="font-semibold text-blue-600 dark:text-blue-400">คุณต้องการชำระเงินตอนนี้เลยหรือไม่?</span>
             </p>
             <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
               (หรือชำระภายหลังได้ที่เมนู "ประวัติการซื้อ")
             </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8 justify-end">
           {/* ขยายปุ่มให้ใหญ่กดง่าย */}
           <button 
             onClick={onClose}
             className="px-6 py-3 text-base font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-xl transition"
           >
             ไว้ทีหลัง
           </button>
           <button 
             onClick={onPay}
             className="px-8 py-3 text-base font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0"
           >
             <CreditCard size={20} /> ชำระเงินทันที
           </button>
        </div>

        {/* ปุ่มปิดมุมขวาบน */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full transition hover:bg-slate-200 dark:hover:bg-slate-700"
        >
            <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default PaymentAlertToast;