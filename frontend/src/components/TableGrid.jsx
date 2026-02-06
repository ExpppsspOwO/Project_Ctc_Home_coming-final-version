import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const TableGrid = ({ tables, activeZone, selectedTables, onToggleSelect }) => {
  const zonePrice = tables && tables.length > 0 ? tables[0].price : 0;
  const getTableColor = (table) => {
    const isSelected = selectedTables.find(t => t._id === table._id);
    if (isSelected) return 'bg-emerald-200 dark:bg-emerald-800 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-100 shadow-md transform scale-105 z-10 ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-slate-900';
    switch (table.status) {
      case 'available': return 'bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:scale-105 cursor-pointer shadow-sm';
      case 'booked': return 'bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-500 cursor-not-allowed opacity-90';
      case 'paid': return 'bg-blue-500 dark:bg-blue-700 border-blue-600 dark:border-blue-500 text-white cursor-not-allowed shadow-md';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'ว่าง';
      case 'booked': return 'รอชำระเงิน';
      case 'paid': return 'เต็มแล้ว';
      default: return '-';
    }
  };

  return (
    <div className="flex-grow w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-5 sm:p-8 rounded-[2rem] shadow-xl border border-white/60 dark:border-slate-800 relative overflow-hidden transition-colors">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-baseline gap-3">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Zone {activeZone}</h2>
          <span className="text-slate-300 dark:text-slate-600 text-2xl font-light">|</span>
          <span className="text-slate-600 dark:text-slate-400 text-base font-medium">ราคา: <span className="text-slate-900 dark:text-emerald-400 font-bold text-xl">{zonePrice.toLocaleString()}</span> บ.</span>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-end gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white dark:bg-slate-700 border-2 border-emerald-400 rounded-full"></div> <span>ว่าง</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-600 rounded-full"></div> <span>รอโอน</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 border-2 border-blue-600 dark:border-blue-500 rounded-full"></div> <span>เต็ม</span></div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {tables.map((table) => (
          <motion.div
            key={table._id}
            whileTap={table.status === 'available' ? { scale: 0.9 } : {}}
            whileHover={table.status === 'available' ? { scale: 1.05, translateY: -3 } : {}}
            onClick={() => onToggleSelect(table)}
            className={`aspect-square flex flex-col items-center justify-center rounded-2xl border-2 font-bold text-xs transition-all duration-300 relative p-1 ${getTableColor(table)}`}
          >
            <div className="flex flex-col items-center justify-center w-full h-full leading-tight z-10">
              <span className="truncate w-full text-center leading-tight text-xs sm:text-sm font-black opacity-90">{table.zone} : {table.row}-{table.column}</span>
              {table.status !== 'available' && <span className="text-[9px] font-medium opacity-70 mt-1 truncate w-full text-center px-1">{getStatusLabel(table.status)}</span>}
            </div>
            {table.status === 'booked' && <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full p-1 shadow-sm border-2 border-white dark:border-slate-800 z-20"><AlertCircle size={10} /></div>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TableGrid;