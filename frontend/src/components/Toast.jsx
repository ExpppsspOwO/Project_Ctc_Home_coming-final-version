import React from 'react';
import { motion } from 'framer-motion';

const toastConfig = {
  success: {
    color: 'bg-green-100 border-green-500 text-green-700',
    icon: (
      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
    ),
  },
  error: {
    color: 'bg-red-100 border-red-500 text-red-700',
    icon: (
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    ),
  },
  info: {
    color: 'bg-blue-100 border-blue-500 text-blue-700',
    icon: (
      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ),
  },
  warning: {
    color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    icon: (
      <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    ),
  },
};

const Toast = ({ message, type, onClose }) => {
  const style = toastConfig[type] || toastConfig.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      layout
      className={`flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg border-l-4 bg-white ${style.color} relative overflow-hidden cursor-pointer mb-3`}
      onClick={onClose}
    >
      <div className="mr-3">
        {style.icon}
      </div>

      <div className="flex-1 text-sm font-medium">
        {message}
      </div>

      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="ml-2 hover:bg-black/10 rounded-full p-1 transition">
        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      {/* Progress Bar (Optional) */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 3, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 ${type === 'error' ? 'bg-red-300' : type === 'success' ? 'bg-green-300' : 'bg-blue-300'}`}
      />
    </motion.div>
  );
};

export default Toast; // ✅ บรรทัดนี้สำคัญมาก! ต้องมี export default