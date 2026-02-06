import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Trash2, Plus, Minus, Loader2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';

const CartSidebar = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      addToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'warning');
      return;
    }

    if (cart.length === 0) return;

    try {
      setIsProcessing(true);
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          totalPrice: totalPrice
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order Failed');

      window.dispatchEvent(new CustomEvent('ORDER_CREATED', { 
        detail: { url: '/my-orders',
           status: 'pending'
         }
       
      }));

      addToast('สั่งซื้อเรียบร้อย! ขอบคุณครับ 🎉', 'success');
      clearCart();
      setIsOpen(false);

    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-slate-900 dark:bg-blue-600 text-white p-4 rounded-full shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex items-center justify-center"
          >
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {totalItems}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

            <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            // ✅ เปลี่ยน bg-white -> dark:bg-slate-900
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[100] flex flex-col transition-colors duration-300"
          >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">ตะกร้าสินค้า</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{cart.length} รายการ</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 flex items-center justify-center transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <ShoppingBag size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">ยังไม่มีสินค้าในตะกร้า</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">เลือกซื้อของที่ระลึกเลย!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item._id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 relative group hover:shadow-md transition-all">

                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-600">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/100' }}
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="font-bold text-slate-800 dark:text-white truncate pr-6">{item.name}</h4>
                          <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm mb-3">฿{item.price.toLocaleString()}</p>

                          {/* ปุ่มบวกลบ */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-lg p-1 border border-slate-100 dark:border-slate-700">
                              <button
                                onClick={() => updateQuantity(item._id, 'decrease')}
                                className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-md shadow-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-90 transition"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-200">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, 'increase')}
                                className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-md shadow-sm text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 active:scale-90 transition"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-5px_30px_rgba(0,0,0,0.05)] z-20">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">ยอดรวม ({totalItems} ชิ้น)</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">฿{totalPrice.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <>ยืนยันการสั่งซื้อ <ArrowRight size={20} /></>}
                  </button>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSidebar;