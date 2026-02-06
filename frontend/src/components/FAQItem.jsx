import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        // ✅ ปรับเส้นขอบให้เป็นสีเทาเข้มในโหมดมืด
        <motion.div variants={fadeInUp} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 md:py-8 flex justify-between items-start text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors gap-6 group">
                {/* ✅ ปรับสีคำถามให้เป็นสีขาว */}
                <span className={`font-bold text-lg md:text-2xl leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                    {question}
                </span>
                {/* ปรับลูกศร */}
                <span className={`transform transition-transform duration-300 mt-1 shrink-0 ${isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
                    <ChevronDown size={28} />
                </span>
            </button>
            <motion.div 
                initial={false} 
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }} 
                className="overflow-hidden"
            >
                {/* ✅ ปรับสีคำตอบให้อ่านง่ายขึ้น */}
                <p className="pb-8 text-slate-500 dark:text-slate-400 leading-relaxed text-base md:text-lg font-light">
                    {answer}
                </p>
            </motion.div>
        </motion.div>
    );
};

export default FAQItem;