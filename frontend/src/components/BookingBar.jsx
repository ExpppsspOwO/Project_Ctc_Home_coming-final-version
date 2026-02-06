import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const BookingBar = ({ selectedTables, onCancel, onConfirm }) => {
  return (
    <AnimatePresence>
      {selectedTables.length > 0 && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-0 right-0 px-4 z-[200] flex justify-center">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-100 dark:border-emerald-900 shadow-2xl rounded-2xl pl-6 pr-3 py-3 flex items-center gap-4 max-w-lg w-full justify-between">
            <div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">รายการที่เลือก</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{selectedTables.length}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">โต๊ะ</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{selectedTables.reduce((sum, t) => sum + t.price, 0).toLocaleString()}.-</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onCancel} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition">ยกเลิก</button>
              <button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2 text-sm">
                จองเลย <Check size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingBar;