// src/components/AgendaItem.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const AgendaItem = ({ item, isEven }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <motion.div
            variants={fadeInUp}
            className={`relative flex flex-col md:flex-row items-start md:items-center cursor-pointer group w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            {/* Timeline Line & Dot */}
            <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 lg:w-16 lg:h-16 rounded-full border-[6px] border-white dark:border-slate-900 transition-all duration-300 shadow-xl z-20 items-center justify-center ${isOpen ? 'bg-emerald-500 scale-110' : 'bg-slate-200 dark:bg-slate-700 group-hover:scale-110'}`}>
                {isOpen ? <div className="w-4 h-4 bg-white rounded-full animate-ping"></div> : <div className="w-4 h-4 bg-white rounded-full"></div>}
            </div>
            
            {/* เส้นแนวตั้ง */}
            <div className={`md:hidden absolute left-4 top-0 h-full w-1 bg-slate-100 dark:bg-slate-800`}></div>
            <div className={`md:hidden absolute left-[10px] top-6 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-md z-10 ${isOpen ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
            
            <div className="w-full md:w-1/2"></div>
            
            {/* Card Content */}
            <div className={`w-full md:w-[calc(50%-4rem)] pl-12 md:pl-0 ${isEven ? 'md:pr-16' : 'md:pl-16'} py-6`}>
                <motion.div layout className={`bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 border-2 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/20' : 'border-slate-100 dark:border-slate-700'}`}>
                    <div className="flex justify-between items-start mb-3">
                        <span className={`px-4 py-1.5 rounded-xl text-sm font-bold shrink-0 ${isOpen ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {item.time}
                        </span>
                        <ChevronDown size={24} className={`text-slate-300 dark:text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                    </div>
                    
                    {/* หัวข้อ */}
                    <h3 className="text-xl md:text-3xl font-black mb-0 text-slate-800 dark:text-white leading-tight break-words">{item.title}</h3>
                    
                    {/* รายละเอียด */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700' : 'max-h-0 opacity-0'}`}>
                        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium break-words whitespace-pre-wrap">
                            {item.desc}
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AgendaItem;