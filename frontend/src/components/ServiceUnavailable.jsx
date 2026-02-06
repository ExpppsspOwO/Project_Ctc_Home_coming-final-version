// src/components/ServiceUnavailable.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceUnavailable = ({ title = "ระบบปิดให้บริการชั่วคราว", message = "ขออภัยในความไม่สะดวก ระบบส่วนนี้ถูกปิดการใช้งานโดยผู้ดูแลระบบ" }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-slate-200 max-w-lg w-full"
      >
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-red-100">
          <AlertOctagon size={48} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-4">
          {title}
        </h1>
        
        <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
          {message}
        </p>

        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95"
        >
          <Home size={20} /> กลับหน้าหลัก
        </Link>
      </motion.div>
    </div>
  );
};

export default ServiceUnavailable;