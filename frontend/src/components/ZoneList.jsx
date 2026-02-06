import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const ZoneList = ({ tablesByZone, onSelectZone, selectedTables = [] }) => {
  return (
    <motion.div
      key="zone-list"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {Object.keys(tablesByZone).sort().map(zoneName => {
        const zoneTables = tablesByZone[zoneName];
        const availableCount = zoneTables.filter(t => t.status === 'available').length;
        const selectedCount = selectedTables.filter(t => t.zone === zoneName).length;

        return (
          <motion.div
            key={zoneName}
            onClick={() => onSelectZone(zoneName)}
            whileHover={{ scale: 1.03, translateY: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`p-6 rounded-3xl shadow-lg border cursor-pointer relative overflow-hidden group transition-all ${
                selectedCount > 0 
                ? 'bg-orange-50/90 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 ring-2 ring-orange-200 dark:ring-orange-900/50' 
                : 'bg-white/80 dark:bg-slate-800/80 border-white dark:border-slate-700 hover:shadow-2xl'
            }`}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 via-teal-50 to-transparent dark:from-emerald-900/20 dark:via-slate-800 dark:to-transparent rounded-bl-full -mr-10 -mt-10 opacity-60 group-hover:scale-125 transition-transform duration-700"></div>
            
            <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Zone {zoneName}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">{zoneName === 'VIP' ? 'VIP Area' : 'Standard Area'}</p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {selectedCount > 0 && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 bg-orange-500 text-white animate-bounce">
                        <CheckCircle size={10} /> เลือก {selectedCount}
                    </span>
                )}

                <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 ${
                    availableCount > 0 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                    {availableCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                    {availableCount} ที่ว่าง
                </span>
              </div>
            </div>

            {/* Grid Preview */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl h-auto min-h-[100px] content-start pointer-events-none border border-slate-100/50 dark:border-slate-700">
              {zoneTables.slice(0, 12).map((t, i) => {
                 const isSelected = selectedTables.find(selected => selected._id === t._id);
                 return (
                    <div key={i} className={`w-full aspect-square rounded-lg flex items-center justify-center text-[8px] font-bold shadow-sm border transition-colors 
                        ${isSelected ? 'bg-orange-500 border-orange-600 text-white scale-110 shadow-md z-10' : 
                          t.status === 'available' ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-800 text-emerald-500 dark:text-emerald-400' : 
                          t.status === 'paid' ? 'bg-blue-400 dark:bg-blue-600 border-blue-500 text-white' : 
                          'bg-amber-100 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                        }`}>
                    {t.row}-{t.column}
                    </div>
                 );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ZoneList;