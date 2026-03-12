import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Trash2, Check, X, Filter, FileText, 
  ShoppingBag, CheckCircle, Clock, ImageIcon, MoreHorizontal,
  ChevronDown, MinusSquare, CheckSquare, UserCheck, AlertCircle, AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useToast } from '../../context/ToastContext';

const SouvenirOrderManager = () => {
  // --- State ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(''); // ✅ State เก็บ Role
  
  // Filter & Search
  const [activeTab, setActiveTab] = useState('pending'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // Bulk Actions
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Action Logic
  const [cancelReason, setCancelReason] = useState('');
  const [cancelType, setCancelType] = useState('cancelled'); 

  // Modals
  const [previewImage, setPreviewImage] = useState(null);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, 
    order: null
  });

  const { addToast } = useToast();

  // --- Initial Fetch ---
  useEffect(() => {
    fetchOrders();
    checkUserRole(); // ✅ เช็ค Role ตอนโหลด
  }, []);

  // ✅ ฟังก์ชันแกะ Role
  const checkUserRole = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(jsonPayload);
        setUserRole(decoded.user?.role || '');
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    const serverUrl = API_BASE_URL.replace('/api', '');
    return `${serverUrl}/uploads/slip_souvenirs/${filename}`;
  };

  const getSouvenirImg = (filename) => {
    if (!filename) return "https://placehold.co/100?text=No+Image";
    if (filename.startsWith('http')) return filename;
    const serverUrl = API_BASE_URL.replace('/api', '');
    return `${serverUrl}/uploads/souvenir_Img/${filename}`;
  };

  // --- API Functions ---
  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/orders/admin/all`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (error) {
      console.error(error);
      addToast('โหลดรายการคำสั่งซื้อไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    const { type, order } = actionModal;
    const token = localStorage.getItem('token');
    
    let endpoint = `${API_BASE_URL}/orders/admin/${order._id}/status`;
    let body = {};

    if (type === 'verify') {
        body = { status: 'paid' };
    } else if (type === 'pickup') {
        body = { status: 'completed' };
    } else if (type === 'cancel') {
        if (!cancelReason.trim()) {
            addToast('กรุณาระบุสาเหตุ', 'error');
            return;
        }

        endpoint = `${API_BASE_URL}/orders/${order._id}/cancel`; 
        body = { status: cancelType, remark: cancelReason }; 
    }

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('อัปเดตสถานะไม่สำเร็จ');
      
      if (cancelType === 'payment_failed' && type === 'cancel') {
          addToast('ปฏิเสธสลิปเรียบร้อย (รอส่งใหม่) ⚠️', 'success');
      } else {
          addToast('อัปเดตสถานะเรียบร้อย ✅', 'success');
      }
      
      fetchOrders();
      closeActionModal();

    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  // --- Bulk Delete ---
  const confirmBulkDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/orders/bulk-delete`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (!res.ok) throw new Error('ลบข้อมูลไม่สำเร็จ');

      setOrders(prev => prev.filter(o => !selectedIds.includes(o._id)));
      addToast(`ลบ ${selectedIds.length} รายการเรียบร้อย`, 'success');
      
      setSelectedIds([]);
      setIsDeleteMode(false);
      setShowBulkDeleteModal(false);

    } catch (error) {
      addToast('เกิดข้อผิดพลาดในการลบหมู่', 'error');
      setShowBulkDeleteModal(false);
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const toggleSelectAll = (filteredOrders) => {
    if (selectedIds.length === filteredOrders.length) setSelectedIds([]); 
    else setSelectedIds(filteredOrders.map(o => o._id)); 
  };

  // --- Helper: Filter Data ---
  const getFilteredOrders = () => {
    let filtered = orders;

    if (activeTab === 'pending') {
        filtered = orders.filter(o => o.status === 'pending' || o.status === 'waiting_verify' || o.status === 'payment_failed');
    } else if (activeTab === 'paid') {
        filtered = orders.filter(o => o.status === 'paid');
    } else if (activeTab === 'history') {
        filtered = orders.filter(o => ['completed', 'cancelled'].includes(o.status));
    }

    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        filtered = filtered.filter(o => 
            o._id.toLowerCase().includes(lower) ||
            o.user?.username?.toLowerCase().includes(lower) ||
            o.items?.some(i => i.name.toLowerCase().includes(lower))
        );
    }
    return filtered;
  };
  
  const filteredOrders = getFilteredOrders();

  const openActionModal = (type, order) => {
    setCancelReason('');
    setCancelType('cancelled');
    setActionModal({ isOpen: true, type, order });
  };
  
  const closeActionModal = () => {
    setActionModal({ isOpen: false, type: null, order: null });
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-gray-400 dark:text-slate-500">กำลังโหลดรายการ...</div>;

  return (
    <div className="w-full pb-20 space-y-6">
      
      {/* --- Header & Stats --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
             <Package className="text-blue-600 dark:text-blue-400" /> จัดการคำสั่งซื้อ
           </h2>
           <p className="text-sm text-gray-500 dark:text-slate-400">ตรวจสอบการโอนเงินและจ่ายสินค้า (รับหน้างาน)</p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
           <input 
             type="text" 
             placeholder="ค้นหา Order ID, ชื่อลูกค้า..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none shadow-sm placeholder-gray-400"
           />
        </div>
      </div>

      {/* --- Tabs & Actions --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-1">
         <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}><Clock size={16} /> รอตรวจสอบ ({orders.filter(o => o.status === 'pending' || o.status === 'waiting_verify' || o.status === 'payment_failed').length})</button>
            <button onClick={() => setActiveTab('paid')} className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'paid' ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}><ShoppingBag size={16} /> รอรับสินค้า ({orders.filter(o => o.status === 'paid').length})</button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 border-b-2 border-gray-500 dark:border-gray-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}><FileText size={16} /> ประวัติ ({orders.filter(o => ['completed', 'cancelled'].includes(o.status)).length})</button>
         </div>

         {/* ✅ เช็ค Role: ถ้าเป็น Officer ซ่อนปุ่มนี้ */}
         {userRole !== 'officer' && (
            <button 
                onClick={() => { setIsDeleteMode(!isDeleteMode); setSelectedIds([]); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0
                    ${isDeleteMode 
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900' 
                    : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700'}`}
            >
                {isDeleteMode ? <X size={14} /> : <Trash2 size={14} />}
                {isDeleteMode ? 'ยกเลิกโหมดลบ' : 'จัดการหลายรายการ'}
            </button>
         )}
      </div>

      {/* --- Table --- */}
      <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-all ${isDeleteMode ? 'ring-2 ring-red-100 dark:ring-red-900/50' : ''}`}>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
               <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 uppercase text-xs font-bold whitespace-nowrap">
                  <tr>
                     {isDeleteMode && (
                        <th className="p-4 w-10 text-center">
                           <button onClick={() => toggleSelectAll(filteredOrders)}>
                              {selectedIds.length === filteredOrders.length && filteredOrders.length > 0
                                ? <CheckSquare size={18} className="text-red-600 dark:text-red-400" />
                                : <MinusSquare size={18} className="text-gray-400 dark:text-slate-500" />
                              }
                           </button>
                        </th>
                     )}
                     <th className="p-4 min-w-[100px]">Order ID</th>
                     <th className="p-4 min-w-[150px]">ลูกค้า</th>
                     <th className="p-4 hidden lg:table-cell min-w-[180px]">รายการสินค้า</th>
                     <th className="p-4 text-center min-w-[120px]">ยอด/สลิป</th>
                     <th className="p-4 text-center min-w-[120px]">สถานะ</th>
                     <th className="p-4 text-center min-w-[100px]">จัดการ</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredOrders.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-10 text-gray-400 dark:text-slate-500">ไม่มีข้อมูลในหน้านี้</td></tr>
                  ) : (
                      filteredOrders.map(order => (
                        <tr key={order._id} 
                            onClick={() => isDeleteMode && toggleSelectOrder(order._id)}
                            className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition cursor-pointer 
                                ${selectedIds.includes(order._id) ? 'bg-red-50/50 dark:bg-red-900/10' : 'bg-white dark:bg-slate-900'}`}
                        >
                           {isDeleteMode && (
                              <td className="p-4 text-center">
                                 <div className={`w-5 h-5 border-2 rounded mx-auto flex items-center justify-center transition 
                                    ${selectedIds.includes(order._id) 
                                        ? 'bg-red-500 border-red-500 dark:bg-red-600 dark:border-red-600' 
                                        : 'border-gray-300 dark:border-slate-500'}`}>
                                    {selectedIds.includes(order._id) && <Check size={14} className="text-white" />}
                                 </div>
                              </td>
                           )}
                           
                           <td className="p-4 font-mono font-bold text-gray-600 dark:text-slate-300 text-xs whitespace-nowrap align-top">
                              #{order._id.slice(-6).toUpperCase()}
                              <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                                {new Date(order.createdAt).toLocaleDateString('th-TH')}
                              </div>
                           </td>
                           <td className="p-4 align-top">
                              <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">{order.user?.username || 'Guest'}</div>
                              <div className="text-xs text-gray-400 dark:text-slate-500 hidden sm:block truncate max-w-[100px] md:max-w-[160px]" title={order.user?.email}>
                                {order.user?.email || '-'}
                              </div>
                           </td>
                           <td className="p-4 hidden lg:table-cell align-top">
                              <div className="flex flex-col gap-1">
                                 {order.items?.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                                       <img src={getSouvenirImg(item.image)} className="w-6 h-6 rounded object-cover border dark:border-slate-600" alt="img" />
                                       <span className="truncate max-w-[140px]" title={item.name}>{item.name}</span>
                                       <span className="text-gray-400 dark:text-slate-600 shrink-0">x{item.quantity}</span>
                                    </div>
                                 ))}
                                 {order.items?.length > 2 && <span className="text-xs text-gray-400 dark:text-slate-500 pl-8">+ อีก {order.items.length - 2} รายการ</span>}
                              </div>
                           </td>
                           <td className="p-4 text-center align-top">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                    ฿{order.totalPrice?.toLocaleString()}
                                </span>
                                {order.slipImage && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setPreviewImage(getImageUrl(order.slipImage)); }}
                                        className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded border dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
                                    >
                                        <ImageIcon size={12} /> สลิป
                                    </button>
                                )}
                              </div>
                           </td>
                           <td className="p-4 text-center align-top">
                              <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase border whitespace-nowrap
                                ${order.status === 'pending' 
                                    ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600' :
                                  order.status === 'waiting_verify' 
                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800' :
                                  order.status === 'paid' 
                                    ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                  order.status === 'completed' 
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                  order.status === 'payment_failed'
                                    ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                                  'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                {order.status === 'pending' ? 'รอชำระเงิน' :
                                 order.status === 'waiting_verify' ? 'รอตรวจสอบ' :
                                 order.status === 'paid' ? 'รอรับสินค้า' :
                                 order.status === 'completed' ? 'สำเร็จ' :
                                 order.status === 'payment_failed' ? 'ชำระไม่ผ่าน' : 'ยกเลิก'}
                              </span>
                              
                              {order.status === 'payment_failed' && (
                                  <div className="text-[10px] text-red-500 mt-1 max-w-[100px] mx-auto truncate" title={order.remark}>
                                      {order.remark}
                                  </div>
                              )}
                           </td>
                           <td className="p-4 text-center align-top">
                              <div className="flex items-center justify-center gap-1.5">
                                 {(order.status === 'pending' || order.status === 'waiting_verify' || order.status === 'payment_failed') && (
                                     <button onClick={(e) => { e.stopPropagation(); openActionModal('verify', order); }} title="อนุมัติ (Verify)" className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition">
                                        <Check size={16} />
                                     </button>
                                 )}
                                 {order.status === 'paid' && (
                                     <button onClick={(e) => { e.stopPropagation(); openActionModal('pickup', order); }} title="ยืนยันการรับของ" className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">
                                        <UserCheck size={16} />
                                     </button>
                                 )}
                                 {!['completed', 'cancelled'].includes(order.status) && (
                                     <button onClick={(e) => { e.stopPropagation(); openActionModal('cancel', order); }} title="ยกเลิก/ปฏิเสธ" className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                                        <X size={16} />
                                     </button>
                                 )}
                              </div>
                           </td>
                        </tr>
                      ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
      
      {/* ... (Bulk Delete Modal & Action Modals เหมือนเดิม) ... */}
      <AnimatePresence>
        {isDeleteMode && selectedIds.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 dark:bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-gray-700">
            <span className="text-sm font-bold">{selectedIds.length} รายการที่เลือก</span>
            <div className="h-4 w-[1px] bg-gray-600"></div>
            <button onClick={() => setShowBulkDeleteModal(true)} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold text-sm"><Trash2 size={16} /> ลบทิ้ง</button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{showBulkDeleteModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-red-900/40 flex items-center justify-center z-[60] backdrop-blur-sm p-4" onClick={() => setShowBulkDeleteModal(false)}><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border border-red-100 dark:border-red-900" onClick={e => e.stopPropagation()}><h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2">ยืนยันลบ {selectedIds.length} รายการ?</h3><p className="text-gray-500 dark:text-slate-400 text-sm mb-6">การกระทำนี้ไม่สามารถกู้คืนได้</p><div className="flex gap-3"><button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl font-bold text-gray-600 dark:text-slate-300">ยกเลิก</button><button onClick={confirmBulkDelete} className="flex-1 py-2 bg-red-600 rounded-xl font-bold text-white shadow-lg hover:bg-red-700">ลบทิ้ง</button></div></motion.div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{actionModal.isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeActionModal}><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 relative overflow-hidden border border-gray-100 dark:border-slate-800">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${actionModal.type === 'cancel' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : actionModal.type === 'pickup' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>{actionModal.type === 'cancel' ? <AlertTriangle size={32} /> : actionModal.type === 'pickup' ? <UserCheck size={32} /> : <Check size={32} />}</div>
                    <h3 className="text-xl font-bold text-center mb-2 text-gray-800 dark:text-white">{actionModal.type === 'verify' && 'ยืนยันการชำระเงิน?'}{actionModal.type === 'pickup' && 'ยืนยันลูกค้าได้รับของแล้ว?'}{actionModal.type === 'cancel' && 'จัดการออเดอร์'}</h3>
                    {actionModal.type === 'cancel' && (
                        <div className="space-y-4 text-left">
                            <p className="text-sm text-gray-600 dark:text-slate-400 text-center">เลือกการดำเนินการสำหรับ Order #{actionModal.order?._id.slice(-6).toUpperCase()}</p>
                            <div className="flex flex-col gap-2">
                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${cancelType === 'cancelled' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-200 dark:border-slate-700'}`}><input type="radio" name="cancelType" value="cancelled" checked={cancelType === 'cancelled'} onChange={() => setCancelType('cancelled')} className="accent-red-500 w-4 h-4" /><div><span className="block text-sm font-bold text-gray-800 dark:text-white">ยกเลิกรายการถาวร (Cancelled)</span><span className="block text-xs text-gray-500 dark:text-slate-400">ออเดอร์จะถูกยกเลิก ลูกค้าต้องสั่งใหม่</span></div></label>
                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${cancelType === 'payment_failed' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'border-gray-200 dark:border-slate-700'}`}><input type="radio" name="cancelType" value="payment_failed" checked={cancelType === 'payment_failed'} onChange={() => setCancelType('payment_failed')} className="accent-amber-500 w-4 h-4" /><div><span className="block text-sm font-bold text-gray-800 dark:text-white">ปฏิเสธสลิป / ยอดไม่ครบ (Failed)</span><span className="block text-xs text-gray-500 dark:text-slate-400">ออเดอร์ยังอยู่ ลูกค้าสามารถส่งสลิปใหม่ได้</span></div></label>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 block">ระบุสาเหตุ (จำเป็น)</label><textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="เช่น สลิปไม่ชัด, ยอดเงินไม่ครบ..." className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition resize-none" rows="3" /></div>
                        </div>
                    )}
                    <div className="flex gap-3 mt-6"><button onClick={closeActionModal} className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700">ยกเลิก</button><button onClick={handleUpdateStatus} className={`flex-1 py-2 rounded-xl font-bold text-white shadow-lg transition active:scale-95 ${actionModal.type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>ยืนยัน</button></div>
                </motion.div></motion.div>)}</AnimatePresence>
      <AnimatePresence>{previewImage && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out" onClick={() => setPreviewImage(null)}><div className="relative max-w-full max-h-[90vh]"><button onClick={() => setPreviewImage(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300"><X size={24} /></button><img src={previewImage} alt="Slip" className="max-w-full max-h-[85vh] rounded-lg bg-gray-200 dark:bg-slate-800" /></div></motion.div>)}</AnimatePresence>
    </div>
  );
};

export default SouvenirOrderManager;