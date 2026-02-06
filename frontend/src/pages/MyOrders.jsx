import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Loader2, CreditCard, CheckCircle, Clock, 
  FileText, Trash2, X, Upload, Copy, AlertCircle, AlertTriangle, ShoppingBag, ImageIcon 
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router-dom';
import ServiceUnavailable from '../components/ServiceUnavailable';
import CountdownTimer from '../components/CountdownTimer';

const SOUVENIR_IMG_URL = 'http://localhost:5000/uploads/souvenir_Img';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

// --- Helper Components ---

const Toast = ({ message, type, onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20 }}
        className={`fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 backdrop-blur-md font-medium min-w-[300px] pointer-events-auto
      ${type === 'success' ? 'bg-white/90 border-emerald-200 text-emerald-700 dark:bg-emerald-900/90 dark:border-emerald-800 dark:text-emerald-200' : ''}
      ${type === 'error' ? 'bg-white/90 border-red-200 text-red-700 dark:bg-red-900/90 dark:border-red-800 dark:text-red-200' : ''}
      ${type === 'info' ? 'bg-white/90 border-blue-200 text-blue-700 dark:bg-blue-900/90 dark:border-blue-800 dark:text-blue-200' : ''}
    `}
    >
        {type === 'success' && <CheckCircle size={18} />}
        {type === 'error' && <AlertCircle size={18} />}
        {type === 'info' && <Clock size={18} />}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><X size={14} /></button>
    </motion.div>
);

const HeroBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
    <motion.div animate={{ x: [-20, 20, -20], y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px]" style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(0,0,0,0) 70%)" }} />
    <motion.div animate={{ x: [20, -20, 20], y: [20, -20, 20], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[10%] right-[-10%] w-[500px] h-[500px]" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%)" }} />
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')", backgroundRepeat: 'repeat' }}></div>
  </div>
);

// OrderTimeline (ภาษาไทย)
const OrderTimeline = ({ status, remark }) => {
  if (status === 'cancelled') {
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold text-center border border-red-100 dark:border-red-800 flex items-center justify-center gap-2">
          <Trash2 size={16} /> รายการถูกยกเลิก
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
           {remark || 'กรุณาตรวจสอบความถูกต้องของสลิปและอัปโหลดใหม่อีกครั้ง'}
        </div>
      </div>
    );
  }

  let step = 0;
  if (status === 'waiting_verify') step = 1;
  if (status === 'paid') step = 2; 
  if (status === 'completed' || status === 'shipped') step = 3;

  return (
    <div className="w-full px-2 py-2 mb-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-4 w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full -z-10" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: step === 0 ? '0%' : step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          className="absolute left-0 top-4 h-1 bg-emerald-500 rounded-full -z-10 transition-all duration-700"
        />

        {[
          { icon: Clock, label: 'รอชำระ' },
          { icon: FileText, label: 'รอตรวจ' },
          { icon: Package, label: 'รอรับของ' },
          { icon: CheckCircle, label: 'สำเร็จ' }
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-2 bg-transparent px-2 transition-colors">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                ${step >= i
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-300 dark:text-slate-500'}`}
            >
              <s.icon size={14} />
            </motion.div>
            <span className={`text-[10px] font-bold ${step >= i ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MyOrders = () => {
  const { config, loading: configLoading } = useConfig();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  const showToast = (message, type = 'info') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  // Auto Polling
  useEffect(() => {
      const hasPending = orders.some(o => o.status === 'waiting_verify');
      let interval;
      if (hasPending) {
          interval = setInterval(() => {
              fetchOrders(true); 
          }, 3000);
      }
      return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getImageUrl = (img) => (!img ? "https://placehold.co/100?text=No+Image" : img.startsWith('http') ? img : `${SOUVENIR_IMG_URL}/${img}`);
  const getSlipUrl = (filename) => (!filename ? null : filename.startsWith('http') ? filename : `${API_BASE_URL.replace('/api', '')}/uploads/slip_souvenirs/${filename}`);

  const fetchOrders = async (silent = false) => {
    const token = localStorage.getItem('token');
    if(!token) { setLoading(false); return; }
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders/my-orders`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) { 
        console.error(error); 
        if(!silent) showToast('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'error');
    } finally { 
        if (!silent) setLoading(false); 
    }
  };

  const handleCancelClick = async (orderId) => {
    setCancelReason('');
    setCancelModal({ isOpen: true, orderId });
  };

  const confirmCancelOrder = async () => {
    if (!cancelModal.orderId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/orders/${cancelModal.orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ remark: cancelReason })
      });

      if (res.ok) {
        showToast('ยกเลิกรายการเรียบร้อย', 'success');
        fetchOrders();
        setCancelModal({ isOpen: false, orderId: null });
      } else {
        const err = await res.json();
        showToast(err.message || 'ยกเลิกไม่สำเร็จ', 'error');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUploadSlip = async () => {
    if (!file || !selectedOrder) return;
    setUploading(true);
    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('slip', file);
      
      const res = await fetch(`${API_BASE_URL}/orders/${selectedOrder._id}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();

      if (res.ok) {
        showToast('ได้รับสลิปแล้ว! ระบบกำลังตรวจสอบอัตโนมัติ โปรดกลับมาหน้านี้ภายหลัง', 'success');
        setSelectedOrder(null);
        setFile(null);
        setPreview(null);
        fetchOrders();
      } else {
        showToast(result.message || 'อัปโหลดไม่สำเร็จ', 'error');
      }
    } catch (err) { showToast(err.message, 'error'); } finally { setUploading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('คัดลอกเลขบัญชีแล้ว', 'success');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  if (!configLoading && config?.system && !config.system.purchasing) {
    return (
      <div className="relative w-full min-h-screen pb-24 overflow-x-hidden pt-32 bg-slate-50 dark:bg-slate-950 transition-colors">
        <HeroBackground />
        <ServiceUnavailable title="ร้านค้าปิดให้บริการ" message="ขออภัย ขณะนี้ระบบสั่งซื้อของที่ระลึกปิดให้บริการชั่วคราว" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen pb-24 overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <HeroBackground />

      <div className="max-w-5xl mx-auto px-4 pt-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex p-4 bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-4 shadow-sm backdrop-blur-sm">
            <Package size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">ประวัติการสั่งซื้อ</h1>
          <p className="text-slate-500 dark:text-slate-400">ติดตามสถานะพัสดุและของที่ระลึก</p>
        </motion.div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white/80 dark:bg-slate-900/80 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors backdrop-blur-sm">
            <p className="text-slate-400 dark:text-slate-500">ไม่มีรายการสั่งซื้อ</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => {
                const isPaid = order.status === 'paid';
                const isCompleted = order.status === 'completed';
                const isSuccess = isPaid || isCompleted;
                
                // 🔥 คำนวณตรงนี้ครั้งเดียว: เช็คว่าหมดเวลาหรือยัง?
                // (ถ้า status เป็น waiting_verify เราจะไม่ถือว่าหมดเวลา เพราะ user ส่งสลิปมาแล้ว)
                const isExpired = order.expiresAt && new Date(order.expiresAt).getTime() < new Date().getTime();
                const isPendingOrFailed = order.status === 'pending' || order.status === 'payment_failed';
                
                // เงื่อนไขการซ่อนปุ่ม: ถ้าเป็น Pending/Failed และหมดเวลาแล้ว -> ซ่อน!
                const hideButtons = isPendingOrFailed && isExpired;

                return (
                  <motion.div
                    key={order._id}
                    layout
                    variants={cardVariants}
                    className={`relative rounded-[2rem] overflow-hidden transition-all duration-500
                        ${isSuccess
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border-2 border-emerald-400/50 shadow-emerald-200 dark:shadow-none shadow-xl' 
                        : 'bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 shadow-xl'}
                    `}
                  >
                    {/* ✨ ลายน้ำ Success */}
                    {isSuccess && (
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
                    )}

                    {/* Header */}
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center backdrop-blur-sm">
                      <span className="text-[10px] bg-slate-800 dark:bg-slate-700 text-white px-2 py-1 rounded-md font-mono">
                          #{order._id.slice(-6).toUpperCase()}
                      </span>
                      
                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1
                          ${isPaid
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                          : isCompleted 
                            ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                          : order.status === 'waiting_verify'
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400'
                          : order.status === 'payment_failed' 
                            ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'}`}>
                        {order.status === 'waiting_verify' && <Loader2 size={12} className="animate-spin"/>}
                        {order.status === 'paid' ? 'ชำระแล้ว (รอรับของ)' 
                         : order.status === 'completed' ? 'ได้รับสินค้าแล้ว'
                         : order.status === 'waiting_verify' ? 'กำลังตรวจสอบ'
                         : order.status === 'payment_failed' ? 'ชำระไม่ผ่าน' 
                         : order.status === 'pending' ? 'รอชำระเงิน' : 'ยกเลิก'}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-6 relative">
                        {/* Stamp */}
                        {isPaid && (
                            <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute right-4 top-4 rotate-12 border-4 border-emerald-500/30 text-emerald-600/30 font-black text-2xl uppercase p-2 rounded-xl pointer-events-none select-none">
                                PAID
                            </motion.div>
                        )}
                        {isCompleted && (
                            <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute right-4 top-4 rotate-12 border-4 border-blue-500/30 text-blue-600/30 font-black text-2xl uppercase p-2 rounded-xl pointer-events-none select-none">
                                COMPLETE
                            </motion.div>
                        )}

                        <div className="flex flex-col gap-3 mb-6">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center">
                              <img src={getImageUrl(item.image)} className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-700 border dark:border-slate-600" alt={item.name} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">x{item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">฿{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>

                        {/* Timeline */}
                        <OrderTimeline status={order.status} remark={order.remark} />

                        {/* Timer / Expiration Message */}
                        {isPendingOrFailed && order.expiresAt && (
                            isExpired ? (
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800/50 text-center mb-6">
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-2 animate-pulse">
                                        <Clock size={14}/> หมดเวลาชำระเงิน (กำลังดำเนินการยกเลิก...)
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50 flex justify-between items-center mb-6">
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                        <Clock size={14}/> หมดเวลาใน
                                    </span>
                                    <CountdownTimer expiresAt={order.expiresAt} onExpire={() => fetchOrders()} />
                                </div>
                            )
                        )}

                        {/* Success Message */}
                        {isPaid && !isCompleted && (
                            <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                <ShoppingBag size={18} />
                                <span className="font-bold text-sm">กรุณานำหน้านี้ไปรับสินค้าที่จุดบริการ</span>
                            </div>
                        )}
                        {isCompleted && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <CheckCircle size={18} />
                                <span className="font-bold text-sm">ได้รับสินค้าเรียบร้อยแล้ว ขอบคุณครับ</span>
                            </div>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-3">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">ราคารวม</p>
                            <p className={`text-xl font-black ${isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-white'}`}>
                                ฿{order.totalPrice.toLocaleString()}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {/* ปุ่มดูสลิป */}
                            {order.slipImage && (
                                <button onClick={() => setViewingImage(getSlipUrl(order.slipImage))} className="p-2 bg-white dark:bg-slate-700 rounded-xl border dark:border-slate-600 shadow-sm text-slate-500 hover:text-blue-500 transition">
                                    <ImageIcon size={20} />
                                </button>
                            )}

                            {/* 🔥 ACTION BUTTONS (จะแสดงก็ต่อเมื่อยังไม่หมดเวลา) 🔥 */}
                            {(order.status === 'pending' || order.status === 'waiting_verify' || order.status === 'payment_failed') && !hideButtons && (
                              <>
                                <button onClick={() => handleCancelClick(order._id)} className="px-4 py-2 bg-white dark:bg-slate-800 text-red-500 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                    ยกเลิก
                                </button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                                  onClick={() => { setSelectedOrder(order); setFile(null); setPreview(null); }}
                                  disabled={order.status === 'waiting_verify'}
                                  className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-lg flex items-center gap-2
                                    ${order.status === 'waiting_verify'
                                      ? 'bg-indigo-400 cursor-not-allowed'
                                      : order.status === 'payment_failed' 
                                         ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                         : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}
                                >
                                  {order.status === 'waiting_verify' ? (
                                      <><Loader2 size={16} className="animate-spin" /> ตรวจสอบ...</>
                                  ) : order.status === 'payment_failed' ? (
                                      <><Upload size={16} /> แก้ไขสลิป</>
                                  ) : (
                                      <><CreditCard size={16} /> ชำระเงิน</>
                                  )}
                                </motion.button>
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

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl transition-colors"
            >
              <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className={`font-bold flex items-center gap-2 ${selectedOrder.status === 'payment_failed' ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}>
                  <CreditCard size={18} /> 
                  {selectedOrder.status === 'payment_failed' ? 'แก้ไขการชำระเงิน' : 'แจ้งโอนเงิน'}
                </h3>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white"><X size={16} /></button>
              </div>

              <div className="p-6">
                <div className={`p-4 rounded-2xl border mb-6 text-center ${selectedOrder.status === 'payment_failed' ? 'bg-red-50 dark:bg-red-900/20 border-red-100' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800'}`}>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-bold uppercase">โอนเงินเข้าบัญชี</p>
                  <p className="font-bold text-slate-800 dark:text-white">{config.payment?.bank || 'ธนาคาร...'}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{config.payment?.accountName || 'ชื่อบัญชี...'}</p>
                  <div
                    onClick={() => copyToClipboard(config.payment?.accountNumber)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95"
                  >
                    <span className="font-mono text-xl font-black text-slate-700 dark:text-white tracking-wider">{config.payment?.accountNumber || '000-0-00000-0'}</span>
                    <Copy size={16} className="text-slate-400" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">ยอดชำระ</p>
                  <p className={`text-4xl font-black mt-1 ${selectedOrder.status === 'payment_failed' ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>฿{selectedOrder.totalPrice.toLocaleString()}</p>
                </div>

                <label className={`block w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition mb-4 overflow-hidden relative
                            ${preview
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  {preview ? <img src={preview} className="absolute inset-0 w-full h-full object-contain" /> : (
                    <>
                      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-sm flex items-center justify-center mb-2 text-emerald-500"><Upload size={20} /></div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-bold">อัปโหลดสลิป</span>
                    </>
                  )}
                </label>

                <button
                  onClick={handleUploadSlip}
                  disabled={!file || uploading}
                  className={`w-full py-3 font-bold rounded-xl shadow-lg dark:shadow-none transition disabled:opacity-50 disabled:shadow-none text-white
                    ${selectedOrder.status === 'payment_failed' 
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                >
                  {uploading ? <Loader2 className="animate-spin mx-auto" /> : (selectedOrder.status === 'payment_failed' ? 'ยืนยันการส่งใหม่' : 'ยืนยันการแจ้งโอน')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cancelModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-900/40 flex items-center justify-center z-[70] backdrop-blur-md p-4"
            onClick={() => setCancelModal({ isOpen: false, orderId: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-[6px] border-red-50/50 dark:border-red-900/10">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">ยืนยันการยกเลิก?</h3>
              <div className="text-left mb-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">
                  ระบุสาเหตุ (ไม่บังคับ)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="เช่น เปลี่ยนใจ, สั่งผิดพลาด..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setCancelModal({ isOpen: false, orderId: null })} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition">
                  เก็บไว้
                </button>
                <button onClick={confirmCancelOrder} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition active:scale-95">
                  ยืนยัน
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{viewingImage && (<div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center" onClick={() => setViewingImage(null)}><img src={viewingImage} className="max-h-[90vh]"/></div>)}</AnimatePresence>
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
};

export default MyOrders;