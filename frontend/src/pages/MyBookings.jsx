// src/pages/MyBookings.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, AlertCircle, Upload, Loader2, Calendar,
    Trash2, CreditCard, ImageIcon, AlertTriangle, Ticket, Copy, CheckCircle, Clock, FileText
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router-dom';
import ServiceUnavailable from '../components/ServiceUnavailable';
import CountdownTimer from '../components/CountdownTimer';

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Toast = ({ message, type, onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20 }}
        className={`fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 backdrop-blur-md font-medium min-w-[300px] pointer-events-auto
      ${type === 'success' ? 'bg-white/90 border-emerald-200 text-emerald-700 dark:bg-emerald-900/90 dark:border-emerald-800 dark:text-emerald-200' : ''}
      ${type === 'error' ? 'bg-white/90 border-red-200 text-red-700 dark:bg-red-900/90 dark:border-red-800 dark:text-red-200' : ''}
      ${type === 'warning' ? 'bg-white/90 border-amber-200 text-amber-700 dark:bg-amber-900/90 dark:border-amber-800 dark:text-amber-200' : ''}
    `}
    >
        {type === 'warning' && <AlertCircle size={18} />}
        {type === 'success' && <CheckCircle size={18} />}
        {type === 'error' && <AlertCircle size={18} />}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><X size={14} /></button>
    </motion.div>
);

const HeroBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: [-100, 100, -100], y: [-50, 50, -50], scale: [1, 1.2, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200 dark:bg-blue-900/40 rounded-full blur-[100px] opacity-40 mix-blend-multiply dark:mix-blend-screen" />
        <motion.div animate={{ x: [50, -50, 50], y: [0, 100, 0], scale: [1.2, 1, 1.2] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-purple-200 dark:bg-purple-900/40 rounded-full blur-[100px] opacity-40 mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
    </div>
);

// ✅ BookingTimeline
const BookingTimeline = ({ status, remark }) => {
    if (status === 'cancelled') {
        return (
            <div className="flex flex-col gap-2 mb-4">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-800 flex items-center justify-center gap-2">
                    <Trash2 size={16} /> การจองถูกยกเลิก
                </div>
                {remark && (
                    <div className="flex items-start justify-center gap-2 text-xs text-red-400/80 bg-red-50/50 dark:bg-red-900/10 p-2 rounded-lg">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>หมายเหตุ: {remark}</span>
                    </div>
                )}
            </div>
        );
    }

    if (status === 'payment_failed') {
        return (
            <div className="flex flex-col gap-2 animate-pulse mb-4">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-800 flex items-center justify-center gap-2">
                    <AlertTriangle size={16} /> การชำระเงินไม่ถูกต้อง
                </div>
                <div className="text-center text-xs text-red-500 font-medium">
                   {remark || 'กรุณาตรวจสอบสลิปและลองใหม่อีกครั้ง'}
                </div>
            </div>
        );
    }

    const steps = [
        { status: 'pending', label: 'รอชำระ', icon: Clock },
        { status: 'waiting_verify', label: 'รอตรวจ', icon: FileText },
        { status: 'verified', label: 'อนุมัติแล้ว', icon: CheckCircle }, 
    ];

    let currentStepIndex = 0;
    if (status === 'waiting_verify') currentStepIndex = 1;
    if (status === 'verified' || status === 'paid') currentStepIndex = 2;

    return (
        <div className="w-full px-2 py-2 mb-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-4 w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full -z-10" />
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: currentStepIndex === 0 ? '0%' : currentStepIndex === 1 ? '50%' : '100%' }}
                    className="absolute left-0 top-4 h-1 bg-blue-500 rounded-full -z-10 transition-all duration-700"
                />

                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 bg-transparent px-2 transition-colors">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.2 }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                ${currentStepIndex >= index
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-300 dark:text-slate-500'}`}
                        >
                            <step.icon size={14} />
                        </motion.div>
                        <span className={`text-[10px] font-bold ${currentStepIndex >= index ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>{step.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MyBookings = () => {
    const { config, loading: configLoading } = useConfig();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });
    const [cancelReason, setCancelReason] = useState('');

    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ✅ Auto Polling
    useEffect(() => {
        const hasPendingVerification = bookings.some(b => b.status === 'waiting_verify');
        let interval;
        if (hasPendingVerification) {
            interval = setInterval(() => {
                fetchMyBookings(true); 
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [bookings]);

    useEffect(() => {
        fetchMyBookings();
        return () => { if (filePreview) URL.revokeObjectURL(filePreview); };
    }, []);

    const getSlipUrl = (filename) => {
        if (!filename) return null;
        if (filename.startsWith('http')) return filename;
        const serverUrl = API_BASE_URL.replace('/api', '');
        return `${serverUrl}/uploads/slip_tables/${filename}`;
    };

    const fetchMyBookings = async (silent = false) => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        try {
            if (!silent) setLoading(true);
            const res = await fetch(`${API_BASE_URL}/bookings/my`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (Array.isArray(data)) setBookings(data);
        } catch (error) {
            console.error(error);
            if (!silent) showToast('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
        } finally { 
            if (!silent) setLoading(false); 
        }
    };

    const handleCancelClick = (bookingId) => {
        setCancelReason('');
        setCancelModal({ isOpen: true, bookingId });
    };

    const confirmCancelBooking = async () => {
        const { bookingId } = cancelModal;
        if (!bookingId) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/bookings/cancel/${bookingId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ remark: cancelReason })
            });
            if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'ยกเลิกไม่สำเร็จ'); }
            showToast('ยกเลิกการจองเรียบร้อยแล้ว', 'success');
            fetchMyBookings();
            setCancelModal({ isOpen: false, bookingId: null });
        } catch (error) {
            showToast(error.message, 'error');
            setCancelModal({ isOpen: false, bookingId: null });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (filePreview) { URL.revokeObjectURL(filePreview); setFilePreview(null); }
        if (selectedFile) {
            if (!selectedFile.type.startsWith('image/')) { showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error'); return; }
            setFile(selectedFile);
            setFilePreview(URL.createObjectURL(selectedFile));
        } else { setFile(null); }
    };

    const closeModal = () => {
        setSelectedBooking(null);
        setFile(null);
        if (filePreview) URL.revokeObjectURL(filePreview);
        setFilePreview(null);
    };

    const handleUpload = async () => {
        if (!file || !selectedBooking) return;
        const token = localStorage.getItem('token');
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('slip', file);
            const res = await fetch(`${API_BASE_URL}/bookings/slip/${selectedBooking._id}`, {
                method: 'PUT', 
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'บันทึกสลิปไม่สำเร็จ');
            
            showToast(data.message || 'ได้รับสลิปแล้ว! กำลังตรวจสอบ...', 'success');
            closeModal();
            fetchMyBookings();
        } catch (error) { 
            showToast(error.message, 'error'); 
        } finally { 
            setUploading(false); 
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('คัดลอกเลขบัญชีแล้ว', 'success');
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-blue-600" /></div>;
    
    if (!configLoading && config?.system && !config.system.booking) {
         return <ServiceUnavailable title="ระบบจองปิดให้บริการ" message="ปิดชั่วคราว" />;
    }

    return (
        <div className="relative min-h-screen w-[100vw] ml-[calc(-50vw+50%)] -mt-8 bg-slate-50/50 dark:bg-slate-950 font-sans pb-20 overflow-x-hidden transition-colors">
            <HeroBackground />

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 pt-32">
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 shadow-sm">
                        <Ticket size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                        รายการจองของฉัน
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">จัดการการจองโต๊ะและแจ้งชำระเงิน</p>
                </motion.header>

                {!Array.isArray(bookings) || bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white/80 dark:bg-slate-800/80 rounded-[2.5rem]">
                        <p className="text-slate-500">ไม่มีรายการจอง</p>
                    </div>
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        {bookings.map((booking) => {
                            const isPaid = booking.status === 'verified' || booking.status === 'paid';
                            
                            // 🔥 คำนวณตรงนี้: เช็คหมดเวลา + เช็คว่าต้องซ่อนปุ่มไหม?
                            const isExpired = booking.expiresAt && new Date(booking.expiresAt).getTime() < new Date().getTime();
                            const isPendingOrFailed = booking.status === 'pending' || booking.status === 'payment_failed';
                            const hideButtons = isPendingOrFailed && isExpired;

                            return (
                                <motion.div
                                    key={booking._id}
                                    layout
                                    variants={cardVariants}
                                    className={`relative rounded-[2rem] overflow-hidden transition-all duration-500
                                        ${isPaid 
                                            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border-2 border-blue-400/50 shadow-blue-200 dark:shadow-none shadow-xl' 
                                            : 'bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 shadow-xl'}
                                    `}
                                >
                                    {/* ✨ ลายน้ำ Success */}
                                    {isPaid && (
                                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
                                    )}

                                    {/* Header */}
                                    <div className="relative px-6 py-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/40 dark:bg-black/20 backdrop-blur-sm">
                                        <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10 dark:text-white">
                                            #{booking.bookingRef || booking._id.slice(-6).toUpperCase()}
                                        </span>
                                        
                                        {/* Status Badge (แปลไทย) */}
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wide transition-all
                                            ${isPaid ? 'bg-blue-500 text-white shadow-lg shadow-blue-300/50' : 
                                              booking.status === 'waiting_verify' ? 'bg-indigo-500 text-white animate-pulse' :
                                              booking.status === 'payment_failed' ? 'bg-red-500 text-white shadow-red-200' :
                                              'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                            {isPaid && <CheckCircle size={12} />}
                                            {booking.status === 'waiting_verify' && <Loader2 size={12} className="animate-spin" />}
                                            
                                            {booking.status === 'verified' || booking.status === 'paid' ? 'อนุมัติแล้ว' : 
                                             booking.status === 'waiting_verify' ? 'กำลังตรวจสอบ...' : 
                                             booking.status === 'payment_failed' ? 'ชำระเงินไม่ผ่าน' : 
                                             booking.status === 'pending' ? 'รอชำระเงิน' : 'ยกเลิก'}
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 relative">
                                        {/* Stamp (แปลไทย) */}
                                        {isPaid && (
                                            <motion.div 
                                                initial={{ scale: 2, opacity: 0 }} 
                                                animate={{ scale: 1, opacity: 1 }} 
                                                className="absolute right-4 top-4 rotate-12 border-4 border-blue-500/30 text-blue-600/30 font-black text-2xl uppercase p-2 rounded-xl pointer-events-none select-none"
                                            >
                                                ชำระแล้ว
                                            </motion.div>
                                        )}

                                        <div className="mb-6">
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">โต๊ะที่จอง</p>
                                            <h2 className="text-4xl font-black text-slate-800 dark:text-white flex items-baseline gap-2">
                                                {booking.tables?.map(t => t.tableNumber).join(', ') || booking.table?.tableNumber}
                                            </h2>
                                        </div>

                                        {/* Timeline */}
                                        <BookingTimeline status={booking.status} remark={booking.remark} />

                                        {/* Timer / Expiration Message */}
                                        {isPendingOrFailed && booking.expiresAt && (
                                            isExpired ? (
                                                // 🔴 Dead Zone: หมดเวลา + กำลังรอตัด + ซ่อนปุ่ม
                                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800/50 text-center mb-6">
                                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-2 animate-pulse">
                                                        <Clock size={14}/> หมดเวลาชำระเงิน (กำลังดำเนินการยกเลิก...)
                                                    </span>
                                                </div>
                                            ) : (
                                                // 🟡 Normal Zone: เวลายังเหลือ
                                                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50 flex justify-between items-center mb-6">
                                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                                        <Clock size={14}/> หมดเวลาใน
                                                    </span>
                                                    <CountdownTimer expiresAt={booking.expiresAt} onExpire={() => fetchMyBookings()} />
                                                </div>
                                            )
                                        )}
                                        
                                        {(booking.status === 'verified' || booking.status === 'paid') && (
                                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center gap-2 text-blue-700 dark:text-blue-300 backdrop-blur-sm">
                                                <CheckCircle size={18} />
                                                <span className="font-bold text-sm">การจองสมบูรณ์ พบกันวันงานครับ!</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-black/20 border-t border-black/5 dark:border-white/5 flex justify-between items-center gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">ยอดชำระรวม</p>
                                            <p className={`text-xl font-black ${isPaid ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-white'}`}>
                                                ฿{(booking.totalPrice || 0).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* ปุ่มดูสลิป */}
                                            {booking.slipImage && (
                                                <button onClick={() => setViewingImage(getSlipUrl(booking.slipImage))} className="p-2 bg-white dark:bg-slate-700 rounded-xl border dark:border-slate-600 shadow-sm text-slate-500 hover:text-blue-500 transition">
                                                    <ImageIcon size={20} />
                                                </button>
                                            )}

                                            {/* 🔥 ACTION BUTTONS: ซ่อนทันทีถ้า hideButtons = true 🔥 */}
                                            {(booking.status === 'pending' || booking.status === 'waiting_verify' || booking.status === 'payment_failed') && !hideButtons && (
                                                <>
                                                    <button 
                                                        onClick={() => handleCancelClick(booking._id)}
                                                        className="px-4 py-2 bg-white dark:bg-slate-800 text-red-500 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                    >
                                                        ยกเลิก
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedBooking(booking)}
                                                        disabled={booking.status === 'waiting_verify'}
                                                        className={`px-6 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition flex items-center gap-2
                                                            ${booking.status === 'waiting_verify' 
                                                                ? 'bg-indigo-400 cursor-not-allowed' 
                                                                : booking.status === 'payment_failed' 
                                                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                                                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                                                    >
                                                        {booking.status === 'waiting_verify' ? (
                                                            <><Loader2 size={16} className="animate-spin" /> ตรวจสอบ...</>
                                                        ) : booking.status === 'payment_failed' ? (
                                                            <><Upload size={16} /> แก้ไขสลิป</>
                                                        ) : (
                                                            <><CreditCard size={16} /> จ่ายเงิน</>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Modals: Upload & Cancel */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4" onClick={closeModal}>
                        <motion.div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                                {/* เปลี่ยนชื่อหัวข้อ */}
                                <h3 className={`text-lg font-bold flex items-center gap-2 ${selectedBooking.status === 'payment_failed' ? 'text-red-600' : 'text-slate-800'}`}>
                                    <CreditCard size={20} />
                                    {selectedBooking.status === 'payment_failed' ? 'แก้ไขหลักฐานการโอน' : 'แจ้งชำระเงิน'}
                                </h3>
                                <button onClick={closeModal}><X size={20} /></button>
                            </div>
                            
                            <div className="p-6">
                                <div className="bg-blue-50 p-4 rounded-2xl mb-6 text-center">
                                     <p className="text-slate-500 text-xs font-bold uppercase">ยอดที่ต้องโอน</p>
                                     <p className="text-3xl font-black text-blue-600">฿{(selectedBooking.totalPrice || 0).toLocaleString()}</p>
                                </div>

                                <label className="block w-full border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer mb-4">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    {file && filePreview ? (
                                        <img src={filePreview} className="h-full object-contain" />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <Upload size={24} className="mx-auto mb-2"/>
                                            <span>แตะเพื่ออัปโหลด</span>
                                        </div>
                                    )}
                                </label>

                                <button onClick={handleUpload} disabled={!file || uploading} className={`w-full py-4 rounded-xl font-bold text-white ${selectedBooking.status === 'payment_failed' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {uploading ? <Loader2 className="animate-spin mx-auto"/> : (selectedBooking.status === 'payment_failed' ? 'ยืนยันการส่งใหม่' : 'ยืนยันการโอนเงิน')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>{cancelModal.isOpen && (
                 <motion.div className="fixed inset-0 bg-red-900/40 flex items-center justify-center z-[70] p-4" onClick={() => setCancelModal({isOpen:false})}>
                     <motion.div className="bg-white rounded-[2rem] w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                         <AlertTriangle size={32} className="mx-auto text-red-500 mb-4"/>
                         <h3 className="text-xl font-bold mb-2">ยืนยันการยกเลิก?</h3>
                         <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="ระบุเหตุผล..." className="w-full p-3 border rounded-xl text-sm mb-4" rows="3"/>
                         <div className="flex gap-3">
                             <button onClick={() => setCancelModal({isOpen:false})} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">เก็บไว้</button>
                             <button onClick={confirmCancelBooking} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">ยืนยัน</button>
                         </div>
                     </motion.div>
                 </motion.div>
            )}</AnimatePresence>
            
            <AnimatePresence>{viewingImage && (<div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center" onClick={() => setViewingImage(null)}><img src={viewingImage} className="max-h-[90vh]"/></div>)}</AnimatePresence>
            <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
        </div>
    );
};

export default MyBookings;