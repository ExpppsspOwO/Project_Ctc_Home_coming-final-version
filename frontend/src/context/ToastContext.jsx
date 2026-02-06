// src/assets/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ใช้ Lucide React เพราะเห็นใน AdminDashboard คุณมีติดตั้งไว้อยู่แล้ว
import { Check, X, AlertCircle, Info } from 'lucide-react'; 

const ToastContext = createContext();

// 👇 จุดที่ Error: ต้องมีคำว่า export ตรงนี้ครับ
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

// 👇 และต้องมี export ตรงนี้ด้วย
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, x: 20 }}
              className={`
                pointer-events-auto px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 backdrop-blur-md font-medium min-w-[300px]
                ${toast.type === 'success' ? 'bg-white/90 border-emerald-200 text-emerald-700' : ''}
                ${toast.type === 'error' ? 'bg-white/90 border-red-200 text-red-700' : ''}
                ${toast.type === 'warning' ? 'bg-white/90 border-amber-200 text-amber-700' : ''}
                ${toast.type === 'info' ? 'bg-white/90 border-blue-200 text-blue-700' : ''}
              `}
            >
              {toast.type === 'success' && <Check size={18} />}
              {toast.type === 'error' && <X size={18} />}
              {toast.type === 'warning' && <AlertCircle size={18} />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};