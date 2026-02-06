import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Copy, Check, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL } from '../config';

// ใช้ Background เดียวกับหน้าอื่นเพื่อให้ Theme ตรงกัน
const HeroBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <motion.div animate={{ x: [-20, 20, -20], y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px]" style={{ background: "radial-gradient(circle, rgba(6, 199, 85, 0.15) 0%, rgba(0,0,0,0) 70%)" }} />
        <motion.div animate={{ x: [20, -20, 20], y: [20, -20, 20], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[10%] right-[-10%] w-[500px] h-[500px]" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)" }} />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')", backgroundRepeat: 'repeat' }}></div>
    </div>
);

const ContactLine = () => {
    const { config, loading } = useConfig();
    const [copied, setCopied] = useState(false);

    // ดึงข้อมูล LINE จาก Database (ผ่าน Context)
    const lineConfig = config?.line || { show: false, id: '', qrCode: '' };

    const getImageUrl = (src) => {
        if (!src) return null;
        if (src.startsWith('http')) return src;
        const serverUrl = API_BASE_URL.replace('/api', '');
        return `${serverUrl}/uploads/site/photos/${src}`; // 👈 path รูป QR Code
    };

    const handleCopy = () => {
        if (lineConfig.id) {
            navigator.clipboard.writeText(lineConfig.id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">Loading...</div>;

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col items-center justify-center px-4">
            <HeroBackground />

            {/* Back Button */}
            <Link to="/" className="absolute top-8 left-8 z-20 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm backdrop-blur-sm">
                    <ArrowLeft size={20} />
                </div>
                <span className="font-bold hidden sm:block">กลับหน้าหลัก</span>
            </Link>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 text-center relative overflow-hidden">
                    
                    {/* Header Decoration */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#06C755]"></div>

                    {/* Logo / Icon */}
                    <div className="w-20 h-20 mx-auto bg-[#06C755] rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-6 transform -rotate-6">
                        <MessageCircle size={40} className="text-white" />
                    </div>

                    <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                        ติดต่อเรา
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        แสกน QR Code หรือแอด ID ด้านล่าง<br/>เพื่อสอบถามข้อมูลเพิ่มเติม
                    </p>

                    {/* QR Code Section */}
                    <div className="bg-white p-4 rounded-3xl shadow-inner border border-slate-100 dark:border-slate-700 mx-auto w-64 h-64 flex items-center justify-center mb-8 relative group">
                        {lineConfig.qrCode ? (
                            <img 
                                /* ❌ ของเดิม (ผิด) src={getImageUrl(lineConfig.qrImage)} */
                                /* ✅ แก้เป็น (ถูก) */
                                src={getImageUrl(lineConfig.qrCode)} 
                                alt="Line QR Code" 
                                className="w-full h-full object-contain rounded-xl"
                            />
                        ) : (
                            <div className="text-slate-300 text-sm">ไม่พบรูป QR Code</div>
                        )}
                        
                        {/* Hover Overlay */}
                        {lineConfig.id && (
                            <a 
                                href={`https://line.me/ti/p/~${lineConfig.id}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                <span className="text-white font-bold flex items-center gap-2">
                                    <ExternalLink size={20} /> เปิดในแอป LINE
                                </span>
                            </a>
                        )}
                    </div>

                    {/* Line ID Section */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 pl-5 pr-2 rounded-full flex items-center justify-between gap-3 mb-6 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">LINE ID</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-slate-800 dark:text-white">
                                {lineConfig.id || "-"}
                            </span>
                            <button 
                                onClick={handleCopy}
                                disabled={!lineConfig.id}
                                className={`p-2.5 rounded-full transition-all duration-300 ${copied ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-sm'}`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Action Button */}
                    <a 
                        href={`https://line.me/ti/p/~${lineConfig.id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`block w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 active:scale-95
                            ${!lineConfig.id ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#06C755] hover:bg-[#05b34c] shadow-green-500/30'}`}
                    >
                        แอดไลน์เลย
                    </a>

                </div>
            </motion.div>
        </div>
    );
};

export default ContactLine;