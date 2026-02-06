// src/components/PaymentModal.jsx
import React, { useState } from 'react';
import { X, Upload, CreditCard, Loader2, Copy, Landmark } from 'lucide-react';
import { API_BASE_URL } from '../config';

const BANK_INFO = {
  bankName: 'ธนาคารกสิกรไทย (KBANK)',
  accountName: 'บจก. ซีทีซี โฮมคัมมิ่ง',
  accountNumber: '012-3-45678-9'
};

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // สั่งปิดพร้อม Animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // เช็คว่าคลิกโดนพื้นหลังหรือเปล่า? (ถ้าโดนพื้นหลังให้ปิด)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_INFO.accountNumber);
    alert('คัดลอกเลขบัญชีเรียบร้อย!');
  };

  const handleSubmit = async () => {
    if (!file) return alert('กรุณาเลือกรูปสลิป');

    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('slip', file);

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order._id}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      alert('แจ้งชำระเงินเรียบร้อย! 💸');
      onSuccess();
      handleClose(); 

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    // เพิ่ม onClick={handleBackdropClick} ที่นี่
    <div 
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 
      ${isClosing ? 'animate-fade-out' : 'animate-fade-in'} 
      bg-slate-900/60 backdrop-blur-sm cursor-pointer`} // cursor-pointer เพื่อสื่อว่ากดปิดได้
    >
      {/* ส่วนเนื้อหา (cursor-default เพื่อไม่ให้เมาส์เป็นรูปมือตอนชี้เนื้อหา) */}
      <div className={`bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl cursor-default
        ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
      >
        
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center gap-2">
            <CreditCard size={20} className="text-emerald-400" /> แจ้งชำระเงิน
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* ยอดเงิน */}
          <div className="text-center">
            <p className="text-slate-500 text-sm mb-1">ยอดที่ต้องโอน</p>
            <p className="text-4xl font-black text-emerald-600 tracking-tight">
              ฿{order.totalPrice.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2 font-mono">Ref: {order._id.slice(-8).toUpperCase()}</p>
          </div>

          <hr className="border-dashed border-slate-200" />

          {/* Bank Detail */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-emerald-600">
                    <Landmark size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-700">{BANK_INFO.bankName}</p>
                    <p className="text-xs text-slate-500">{BANK_INFO.accountName}</p>
                </div>
            </div>

            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 relative z-10">
                <span className="text-lg font-mono font-bold text-slate-700 tracking-wider pl-1">
                    {BANK_INFO.accountNumber}
                </span>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md transition font-medium"
                >
                    <Copy size={12} /> คัดลอก
                </button>
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">แนบหลักฐานการโอน (สลิป)</label>
            <label className="cursor-pointer group relative w-full h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/10 flex flex-col items-center justify-center bg-slate-50 transition overflow-hidden">
              {preview ? (
                <img src={preview} className="w-full h-full object-contain p-2" alt="Slip Preview" />
              ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-600 transition">
                  <Upload size={32} className="mb-2" />
                  <span className="text-xs font-medium">แตะเพื่อเลือกรูปสลิป</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:scale-[0.98] transition flex justify-center items-center gap-2 shadow-lg shadow-emerald-200/50"
          >
            {uploading ? <Loader2 className="animate-spin" /> : 'ยืนยันการโอนเงิน'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;