// src/components/HeroBackground.jsx
import React from 'react';
import { motion } from 'framer-motion';

const HeroBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        
        {/* ก้อนที่ 1: สีฟ้า (ขยับเบาๆ) */}
        <motion.div 
            animate={{ 
                x: [-30, 30, -30], 
                y: [-20, 20, -20], 
                rotate: [0, 20, 0] 
            }} 
            transition={{ 
                duration: 15, 
                repeat: Infinity, 
                ease: "linear" 
            }} 
            style={{ willChange: "transform" }}
            // ✅ เพิ่ม dark:mix-blend-screen ให้แล้วครับ (โหมดมืดจะสว่างสวย ไม่จมหาย)
            className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[90px] mix-blend-multiply dark:mix-blend-screen" 
        />

        {/* ก้อนที่ 2: สีเขียว (ขยับสวนทาง) */}
        <motion.div 
            animate={{ 
                x: [30, -30, 30], 
                y: [20, -20, 20], 
                rotate: [0, -20, 0] 
            }} 
            transition={{ 
                duration: 18, 
                repeat: Infinity, 
                ease: "linear" 
            }} 
            style={{ willChange: "transform" }}
            // ✅ เพิ่ม dark:mix-blend-screen ให้แล้วเช่นกัน
            className="absolute top-[5%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-[90px] mix-blend-multiply dark:mix-blend-screen" 
        />

        {/* Noise Texture (บางๆ) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    </div>
);

export default HeroBackground;