import React from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
    <motion.div 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center mb-10 md:mb-20 px-4"
    >
        {Icon && (
            // ปรับพื้นหลังไอคอนให้เข้มขึ้นในโหมดมืด
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 mb-6 shadow-sm">
                <Icon size={32} />
            </div>
        )}
        {/* ✅ เพิ่ม dark:text-white */}
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-800 dark:text-white mb-4 tracking-tight break-words leading-tight">
            {title}
        </h2>
        {/* ✅ เพิ่ม dark:text-slate-400 */}
        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg md:text-2xl font-light max-w-3xl mx-auto leading-relaxed">
            {subtitle}
        </p>
    </motion.div>
);

export default SectionHeader;