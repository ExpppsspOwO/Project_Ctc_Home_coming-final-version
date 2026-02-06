import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon, X, Search, Edit2, Trash2, Check,
  AlertTriangle, Save, Eraser, CheckSquare, MinusSquare,
  Phone, Mail, ArrowRight, XCircle, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useToast } from '../../context/ToastContext';

const BookingManager = () => {
  // --- State Management ---
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // Filter & Search
  // ✅ เพิ่ม Tab 'payment_failed'
  const [historyTab, setHistoryTab] = useState('verified'); 
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk Delete Mode
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Action Modal
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // 'approve', 'cancel', 'edit'
    bookingId: null,
    data: null
  });

  // State for Reject/Cancel Options
  // ✅ เพิ่ม State สำหรับเลือกว่าจะ ยกเลิกถาวร หรือ แค่ปฏิเสธสลิป
  const [cancelType, setCancelType] = useState('cancelled'); // 'cancelled' | 'payment_failed'

  // State for Edit Form
  const [editData, setEditData] = useState({
    username: '',
    phone: '',
    email: '',
    tableMappings: []
  });

  const [remark, setRemark] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchTables();
  }, []);

  const getSlipUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    const serverUrl = API_BASE_URL.replace('/api', '');
    return `${serverUrl}/uploads/slip_tables/${filename}`;
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    } catch (error) {
      console.error(error);
      addToast('โหลดข้อมูลการจองล้มเหลว', 'error');
    } finally { setLoading(false); }
  };

  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tables`);
      const data = await res.json();
      setTables(data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  // --- Modal Handlers ---
  const openActionModal = (type, booking) => {
    if (type === 'edit') {
      const currentTables = booking.tables || (booking.table ? [booking.table] : []);

      setEditData({
        username: booking.user?.username || '',
        phone: booking.user?.phone || '',
        email: booking.user?.email || '',
        tableMappings: currentTables.map(t => {
          let realId = t;
          if (typeof t === 'object' && t !== null) {
            realId = t._id || t.tableId;
          }
          return {
            originalId: realId,
            newTableId: realId,
            label: t.tableNumber || '?'
          };
        })
      });
    }

    // Reset Cancel Type to default 'cancelled'
    setCancelType('cancelled');

    setActionModal({
      isOpen: true,
      type: type,
      bookingId: booking._id,
      data: booking
    });
    setRemark('');
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, type: null, bookingId: null, data: null });
    setRemark('');
    setEditData({ username: '', phone: '', email: '', tableMappings: [] });
  };

  const handleTableChange = (index, newId) => {
    const updatedMappings = [...editData.tableMappings];
    updatedMappings[index].newTableId = newId;
    setEditData({ ...editData, tableMappings: updatedMappings });
  };

  const handleConfirmAction = async () => {
    const { type, bookingId } = actionModal;
    const token = localStorage.getItem('token');

    try {
      if (type === 'approve') {
        const res = await fetch(`${API_BASE_URL}/bookings/approve/${bookingId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to approve');
        addToast('อนุมัติเรียบร้อย ✅', 'success');

      } else if (type === 'cancel') {
        if (!remark.trim()) {
          addToast('กรุณาระบุสาเหตุ', 'warning');
          return;
        }
        
        // ✅ ส่งค่า status ไปด้วย (cancelled หรือ payment_failed)
        const res = await fetch(`${API_BASE_URL}/bookings/cancel/${bookingId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              remark: remark,
              status: cancelType // ส่งค่านี้ไปให้ Backend ตัดสินใจคืนโต๊ะหรือไม่
          })
        });
        if (!res.ok) throw new Error('Failed to update status');
        
        if (cancelType === 'payment_failed') {
            addToast('แจ้งสลิปไม่ผ่านเรียบร้อย (รอส่งใหม่) ⚠️', 'success');
        } else {
            addToast('ยกเลิกรายการเรียบร้อย 🗑️', 'success');
        }

      } else if (type === 'edit') {
        const res = await fetch(`${API_BASE_URL}/bookings/update/${bookingId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: editData.username,
            phone: editData.phone,
            email: editData.email,
            tables: editData.tableMappings.map(m => m.newTableId)
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'แก้ไขไม่สำเร็จ');
        }
        addToast('บันทึกการแก้ไขเรียบร้อย 💾', 'success');
      }

      closeActionModal();
      fetchBookings();
      fetchTables();

    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  // --- Bulk Delete Logic ---
  const toggleDeleteMode = () => { setIsDeleteMode(!isDeleteMode); setSelectedIds([]); };
  const toggleSelectBooking = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    else setSelectedIds([...selectedIds, id]);
  };
  const toggleSelectAll = (filteredHistory) => {
    if (selectedIds.length === filteredHistory.length) setSelectedIds([]);
    else setSelectedIds(filteredHistory.map(b => b._id));
  };
  const onClickBulkDelete = () => { if (selectedIds.length > 0) setShowBulkDeleteModal(true); };

  const confirmBulkDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!res.ok) throw new Error('ลบข้อมูลไม่สำเร็จ');
      setBookings(prev => prev.filter(b => !selectedIds.includes(b._id)));
      addToast(`ลบ ${selectedIds.length} รายการเรียบร้อย`, 'success');
      setSelectedIds([]); setIsDeleteMode(false); setShowBulkDeleteModal(false);
    } catch (error) {
      addToast('เกิดข้อผิดพลาดในการลบหมู่', 'error');
      setShowBulkDeleteModal(false);
    }
  };

  // --- Filter Logic ---
  // ✅ 1. เพิ่ม payment_failed เข้าไปในรายการรอตรวจสอบ (เพื่อให้ Admin เห็นและกด Cancel/Reject ได้)
  const pendingBookings = bookings.filter(b => 
      b.status === 'pending' || 
      b.status === 'waiting_verify' || 
      b.status === 'payment_failed'
  );

  const historyBookings = bookings.filter(b => {
    // ✅ 2. Logic แยก Tab
    let statusMatch = false;
    if (historyTab === 'verified') statusMatch = (b.status === 'verified' || b.status === 'paid');
    else if (historyTab === 'payment_failed') statusMatch = (b.status === 'payment_failed'); // Tab ใหม่
    else statusMatch = (b.status === 'cancelled' || b.status === 'rejected');
    
    if (!statusMatch) return false;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const ref = b.bookingRef?.toLowerCase() || '';
      const username = b.user?.username?.toLowerCase() || '';
      const tableNums = b.tables?.map(t => t.tableNumber).join(' ') || b.table?.tableNumber || '';

      return username.includes(lowerSearch) || ref.includes(lowerSearch) || tableNums.includes(lowerSearch);
    }
    return true;
  });

  if (loading) return <div className="text-center py-10 animate-pulse text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="w-full space-y-8 pb-20">

      {/* --- Section 1: Pending Items (รวม Failed) --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">⏳ รายการรอตรวจสอบ ({pendingBookings.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingBookings.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500">ไม่มีรายการค้าง</div>
          ) : (
            pendingBookings.map(booking => (
              <div key={booking._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      โต๊ะ {booking.tables?.length > 0 ? booking.tables.map(t => t.tableNumber).join(', ') : booking.table?.tableNumber || '?'}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 text-xs">Zone: {booking.tables?.[0]?.tableNumber?.charAt(0) || '-'}</p>
                  </div>
                  {/* ✅ Badge Status Update */}
                  <span className={`px-2 py-1 rounded text-xs font-bold 
                  ${booking.status === 'waiting_verify'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : booking.status === 'payment_failed'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' // สีแดงสำหรับ Failed
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    {booking.status === 'waiting_verify' ? 'รอตรวจสอบสลิป' 
                     : booking.status === 'payment_failed' ? 'ชำระไม่ผ่าน' 
                     : 'รอโอน'}
                  </span>
                </div>

                <div className="flex-1 space-y-2 mb-4 text-sm text-gray-600 dark:text-slate-300">
                  <p>💰 <span className="font-bold text-gray-900 dark:text-white">{(booking.totalPrice || booking.table?.price || 0).toLocaleString()} บ.</span></p>
                  <p>👤 {booking.user?.username}</p>
                  
                  {/* ถ้าเป็น Failed ให้โชว์เหตุผลด้วย */}
                  {booking.status === 'payment_failed' && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-800">
                          ⚠️ {booking.remark}
                      </div>
                  )}

                  {booking.slipImage ? (
                    <div onClick={() => setPreviewImage(getSlipUrl(booking.slipImage))} className="mt-3 group relative overflow-hidden rounded-lg border dark:border-slate-600 bg-gray-100 dark:bg-slate-700 cursor-pointer h-48 w-full">
                      <img src={getSlipUrl(booking.slipImage)} alt="slip" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" onError={(e) => e.target.src = 'https://placehold.co/400x300?text=Image+Error'} />
                    </div>
                  ) : <div className="mt-2 p-4 bg-gray-50 dark:bg-slate-700/50 border border-dashed dark:border-slate-600 rounded-lg text-center text-xs text-gray-400 dark:text-slate-500 py-8">(ยังไม่แนบสลิป)</div>}
                </div>

                <div className="flex gap-2 mt-auto">
                  {/* ปุ่ม Cancel จะเปิด Modal ให้เลือกว่าจะ Reject หรือ Cancel ถาวร */}
                  <button onClick={() => openActionModal('cancel', booking)} className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-bold transition">ยกเลิก/ไม่อนุมัติ</button>
                  <button onClick={() => openActionModal('approve', booking)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition">อนุมัติ</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Section 2: History (Table) --- */}
      <div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              📜 ประวัติการดำเนินการ
            </h2>
            <button
              onClick={toggleDeleteMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isDeleteMode
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
            >
              {isDeleteMode ? <X size={14} /> : <Eraser size={14} />}
              <span>{isDeleteMode ? 'ยกเลิก' : 'ล้างประวัติ'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0">
            {/* ✅ Filter Tabs (3 Tabs) */}
            <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-lg flex shrink-0">
              <button onClick={() => setHistoryTab('verified')} disabled={isDeleteMode} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${historyTab === 'verified' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>อนุมัติแล้ว ✅</button>
              <button onClick={() => setHistoryTab('payment_failed')} disabled={isDeleteMode} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${historyTab === 'payment_failed' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>ชำระไม่ผ่าน ⚠️</button>
              <button onClick={() => setHistoryTab('cancelled')} disabled={isDeleteMode} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${historyTab === 'cancelled' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-slate-400'}`}>ยกเลิกแล้ว 🗑️</button>
            </div>
            
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
              <input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-full shadow-sm placeholder-gray-400 dark:placeholder-slate-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden overflow-x-auto transition-all ${isDeleteMode ? 'ring-2 ring-red-100 dark:ring-red-900' : ''}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-slate-400 uppercase text-xs">
              <tr>
                {isDeleteMode && (
                  <th className="p-3 text-center w-10">
                    <button onClick={() => toggleSelectAll(historyBookings)} className="text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 transition">
                      {selectedIds.length > 0 && selectedIds.length === historyBookings.length ? <CheckSquare size={18} className="text-red-500" /> : <MinusSquare size={18} />}
                    </button>
                  </th>
                )}
                <th className="p-3 text-center w-10 text-gray-400 dark:text-slate-500">#</th>
                <th className="p-3">รหัสจอง / โต๊ะ</th>
                <th className="p-3">ราคา</th>
                <th className="p-3">ผู้จอง</th>
                <th className="p-3 hidden lg:table-cell">เวลา</th>
                <th className="p-3 hidden md:table-cell">สถานะ</th>
                <th className="p-3 hidden lg:table-cell">สลิป</th>
                {(historyTab === 'cancelled' || historyTab === 'payment_failed') && <th className="p-3 hidden lg:table-cell">หมายเหตุ</th>}
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {historyBookings.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400 dark:text-slate-500">ไม่พบข้อมูล</td></tr>
              ) : (
                historyBookings.map((b, index) => (
                  <tr key={b._id} className={`transition-colors border-b dark:border-slate-700 last:border-b-0 cursor-pointer ${isDeleteMode && selectedIds.includes(b._id) ? 'bg-red-50/50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`} onClick={() => isDeleteMode && toggleSelectBooking(b._id)}>
                    {isDeleteMode && (
                      <td className="p-3 text-center align-top relative">
                        <div className={`w-5 h-5 border-2 rounded mx-auto mt-1 flex items-center justify-center transition-all ${selectedIds.includes(b._id) ? 'bg-red-500 border-red-500' : 'border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-800'}`}>
                          {selectedIds.includes(b._id) && <Check size={14} className="text-white" />}
                        </div>
                      </td>
                    )}
                    <td className="p-3 text-center font-bold text-gray-400 dark:text-slate-500 align-top">{index + 1}</td>
                    <td className="p-3 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-gray-800 dark:text-white text-xs sm:text-sm tracking-wide break-all">{b.bookingRef || ('#' + b._id.slice(-6).toUpperCase())}</span>
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit border ${b.status === 'verified' || b.status === 'paid' ? 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'text-red-700 bg-red-50 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                          📍 {b.tables?.map(t => t.tableNumber).join(', ') || b.table?.tableNumber || '?'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700 dark:text-slate-300 font-medium align-top">{(b.totalPrice || b.table?.price || 0).toLocaleString()}</td>
                    <td className="p-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 dark:text-slate-300 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{b.user?.username || 'Guest'}</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 hidden sm:block truncate max-w-[120px]">{b.user?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap hidden lg:table-cell align-top">{b.paymentDate ? new Date(b.paymentDate).toLocaleDateString('th-TH') : new Date(b.createdAt).toLocaleDateString('th-TH')}</td>
                    <td className="p-3 whitespace-nowrap hidden md:table-cell align-top">
                      {(b.status === 'verified' || b.status === 'paid') && <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-[10px] font-bold border border-emerald-100 dark:border-emerald-800">VERIFIED</span>}
                      {b.status === 'payment_failed' && <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-[10px] font-bold border border-amber-100 dark:border-amber-800">FAILED</span>}
                      {(b.status === 'cancelled' || b.status === 'rejected') && <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-[10px] font-bold border border-red-100 dark:border-red-800">CANCELLED</span>}
                    </td>
                    <td className="p-3 whitespace-nowrap hidden lg:table-cell align-top">
                      {b.slipImage ? <button onClick={(e) => { e.stopPropagation(); setPreviewImage(getSlipUrl(b.slipImage)); }} className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 underline text-xs font-medium">ดูรูป</button> : '-'}
                    </td>
                    {(historyTab === 'cancelled' || historyTab === 'payment_failed') && <td className="p-3 text-xs text-red-500 max-w-[150px] truncate hidden lg:table-cell align-top" title={b.remark}>{b.remark || '-'}</td>}
                    <td className="p-3 text-center align-top">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); openActionModal('edit', b); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-600 dark:hover:text-blue-400 rounded-lg transition-colors" title="แก้ไข"><Edit2 size={16} /></button>
                        {b.status !== 'cancelled' && b.status !== 'rejected' && <button onClick={(e) => { e.stopPropagation(); openActionModal('cancel', b); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors" title="ยกเลิก"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* --- Floating Bottom Action Bar & Bulk Modal --- */}
      <AnimatePresence>
        {isDeleteMode && selectedIds.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 dark:bg-slate-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6">
            <span className="text-sm font-bold">{selectedIds.length} รายการ</span>
            <button onClick={onClickBulkDelete} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold text-sm"><Trash2 size={16} /> ลบทิ้ง</button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBulkDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] backdrop-blur-sm p-4" onClick={() => setShowBulkDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-red-600 mb-2">ยืนยันลบ?</h3>
              <div className="flex gap-3 mt-4"><button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-white rounded-xl">ยกเลิก</button><button onClick={confirmBulkDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl">ยืนยัน</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Action Modal (Approve / Cancel / Edit) --- */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm p-4 items-end sm:items-center"
            onClick={closeActionModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className={`p-4 border-b dark:border-slate-800 flex justify-between items-center shrink-0 ${actionModal.type === 'cancel' ? 'bg-red-50 dark:bg-red-900/20' :
                  actionModal.type === 'approve' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
                }`}>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${actionModal.type === 'cancel' ? 'text-red-700 dark:text-red-400' :
                    actionModal.type === 'approve' ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'
                  }`}>
                  {actionModal.type === 'cancel' && <><AlertTriangle size={20} /> จัดการรายการ</>}
                  {actionModal.type === 'approve' && <><Check size={20} /> อนุมัติการจอง</>}
                  {actionModal.type === 'edit' && <><Edit2 size={20} /> แก้ไขข้อมูลการจอง</>}
                </h3>
                <button onClick={closeActionModal} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-slate-400"><X size={20} /></button>
              </div>

              {/* Body (Scrollable) */}
              <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">

                {/* --- CASE: Cancel / Reject --- */}
                {actionModal.type === 'cancel' && (
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-slate-300 text-sm">เลือกการดำเนินการสำหรับ <span className="font-bold text-gray-800 dark:text-white">{actionModal.data?.user?.username}</span></p>
                    
                    {/* ✅ ตัวเลือก Radio Button */}
                    <div className="flex flex-col gap-2">
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${cancelType === 'cancelled' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-200 dark:border-slate-700'}`}>
                            <input type="radio" name="cancelType" value="cancelled" checked={cancelType === 'cancelled'} onChange={() => setCancelType('cancelled')} className="accent-red-500 w-4 h-4" />
                            <div>
                                <span className="block text-sm font-bold text-gray-800 dark:text-white">ยกเลิกรายการถาวร (Cancelled)</span>
                                <span className="block text-xs text-gray-500 dark:text-slate-400">โต๊ะจะว่างทันทีและลูกค้าต้องจองใหม่</span>
                            </div>
                        </label>
                        
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${cancelType === 'payment_failed' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'border-gray-200 dark:border-slate-700'}`}>
                            <input type="radio" name="cancelType" value="payment_failed" checked={cancelType === 'payment_failed'} onChange={() => setCancelType('payment_failed')} className="accent-amber-500 w-4 h-4" />
                            <div>
                                <span className="block text-sm font-bold text-gray-800 dark:text-white">ปฏิเสธสลิป / ยอดไม่ครบ (Failed)</span>
                                <span className="block text-xs text-gray-500 dark:text-slate-400">โต๊ะจะยังถูกจองอยู่ เพื่อให้ลูกค้าส่งสลิปใหม่ได้</span>
                            </div>
                        </label>
                    </div>

                    <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="ระบุสาเหตุ (จำเป็น)..." className="w-full p-3 border dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-red-200 resize-none h-24 text-sm bg-white dark:bg-slate-800 dark:text-white" autoFocus />
                  </div>
                )}

                {/* --- CASE: Edit & Move Table --- */}
                {actionModal.type === 'edit' && (
                  <div className="space-y-6">

                    {/* 1. ข้อมูลผู้จอง */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl space-y-3 border border-gray-100 dark:border-slate-700">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ข้อมูลผู้ติดต่อ</h4>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">ชื่อผู้จอง</label>
                          <input
                            type="text"
                            value={editData.username}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                            className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none text-sm text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Phone size={12} /> เบอร์โทร</label>
                            <input
                              type="text"
                              value={editData.phone}
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                              className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none text-sm text-gray-900 dark:text-white"
                              placeholder="-"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Mail size={12} /> Email</label>
                            <input
                              type="text"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full p-2 border dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-200 outline-none text-sm text-gray-900 dark:text-white"
                              placeholder="-"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. จัดการโต๊ะ (Multi-Table) */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">จัดการโต๊ะที่จอง ({editData.tableMappings.length} โต๊ะ)</h4>

                      <div className="space-y-3">
                        {editData.tableMappings.map((mapping, index) => (
                          <div key={index} className="flex items-center gap-2 bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-800">
                            {/* โต๊ะเดิม */}
                            <div className="shrink-0 w-12 h-10 bg-white dark:bg-slate-800 rounded border dark:border-slate-600 flex items-center justify-center font-bold text-gray-600 dark:text-white shadow-sm text-sm">
                              {mapping.label}
                            </div>

                            <ArrowRight size={16} className="text-blue-300" />

                            {/* เลือกโต๊ะใหม่ */}
                            <select
                              value={mapping.newTableId}
                              onChange={(e) => handleTableChange(index, e.target.value)}
                              className={`flex-1 p-2 border rounded-lg outline-none text-sm font-bold transition dark:bg-slate-700 dark:text-white ${mapping.newTableId !== mapping.originalId
                                  ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-500'
                                  : 'bg-white text-gray-700 dark:border-slate-600'
                                }`}
                            >
                              <option value={mapping.originalId}>
                                {mapping.label} (ปัจจุบัน)
                              </option>
                              <optgroup label="--- เปลี่ยนเป็นโต๊ะว่าง ---">
                                {tables.filter(t => t.status === 'available').map(t => (
                                  <option key={t._id} value={t._id}>
                                    {t.tableNumber} (โซน {t.zone})
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 text-center">
                        * สามารถเปลี่ยนโต๊ะได้ทีละรายการตามจำนวนที่จองไว้
                      </p>
                    </div>

                  </div>
                )}

                {/* --- CASE: Approve --- */}
                {actionModal.type === 'approve' && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2"><Check size={32} /></div>
                    <p className="text-gray-700 dark:text-slate-300 font-medium">ยืนยันการอนุมัติยอดเงิน?</p>
                  </div>
                )}

              </div>

              {/* Footer Buttons */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800 flex gap-3 justify-end shrink-0 border-t dark:border-slate-700">
                <button onClick={closeActionModal} className="px-4 py-2 text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition text-sm">ยกเลิก</button>
                <button onClick={handleConfirmAction} className={`px-6 py-2 text-white font-bold rounded-lg shadow-lg transition active:scale-95 flex items-center gap-2 text-sm ${actionModal.type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : actionModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {actionModal.type === 'edit' && <Save size={16} />} ยืนยัน
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
            <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPreviewImage(null)} className="absolute top-3 right-3 z-50 p-1.5 bg-black/50 text-white rounded-full"><X size={20} /></button>
              <motion.img src={previewImage} initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="block max-w-full max-h-[85vh] object-contain bg-gray-100" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingManager;