import React from 'react';
import { Map, X } from 'lucide-react';

const MiniMap = ({ tables, isVisible, onClose }) => {
  if (!isVisible) return null;

  const getZoneLayout = () => {
    if (tables.length === 0) return { maxCols: 1, maxRows: 1 };
    const maxCols = Math.max(...tables.map(t => t.column || 0), 1);
    const maxRows = Math.max(...tables.map(t => t.row || 0), 1);
    return { maxCols, maxRows };
  };

  const { maxCols, maxRows } = getZoneLayout();

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white dark:border-slate-700 sticky top-4 shrink-0 transition-colors w-full md:w-80">
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400"><Map size={20} /></div>
          <div><h3 className="font-bold text-slate-800 dark:text-white text-sm">Live Map</h3><p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">ผังจำลองตำแหน่ง</p></div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"><X size={18} /></button>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex justify-center items-center min-h-[180px]">
        <div className="grid gap-[3px] rounded-2xl" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)`, gridTemplateRows: `repeat(${maxRows}, 1fr)`, width: '100%', aspectRatio: `${maxCols} / ${maxRows}` }}>
          {tables.map(t => (
            <div 
              key={t._id} 
              style={{ gridColumn: t.column, gridRow: t.row }} 
              className={`w-full h-full rounded-[2px] flex flex-col items-center justify-center text-[8px] font-bold shadow-sm transition-colors duration-500 
              ${t.status === 'available' ? 'bg-emerald-400 text-emerald-100 dark:bg-emerald-500 dark:text-emerald-950' : 
                t.status === 'paid' ? 'bg-blue-500 text-white dark:bg-blue-600' : 
                'bg-amber-300 text-amber-800 dark:bg-amber-500 dark:text-amber-900'}`} 
              title={`โต๊ะ ${t.row}-${t.column}`}
            >
              {`${t.row}-${t.column}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiniMap;