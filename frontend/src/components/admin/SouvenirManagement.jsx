import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, ImageIcon, UploadCloud } from 'lucide-react';
import { API_BASE_URL } from '../../config';

// URL รูปภาพ
const SOUVENIR_IMG_URL = 'http://localhost:5000/uploads/souvenir_Img';

const SouvenirManagement = () => {
  const [souvenirs, setSouvenirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', price: '', description: '', isAvailable: true });
  const [file, setFile] = useState(null); // เก็บไฟล์รูป
  const [filePreview, setFilePreview] = useState(null); // รูปตัวอย่าง
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchSouvenirs(); }, []);

  const fetchSouvenirs = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/souvenirs/admin/all`, { 
         headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await res.json();
      if (Array.isArray(data)) setSouvenirs(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      setUploading(true);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('description', formData.description);
      data.append('isAvailable', formData.isAvailable); 
      
      if (file) {
        data.append('image', file); 
      }

      let url = `${API_BASE_URL}/souvenirs`;
      let method = 'POST';

      if (editingItem) {
        url = `${API_BASE_URL}/souvenirs/${editingItem._id}`;
        method = 'PUT'; 
      }

      const res = await fetch(url, {
        method: method,
        headers: { 
            'Authorization': `Bearer ${token}` 
        },
        body: data
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'บันทึกไม่สำเร็จ');
      }

      alert('บันทึกเรียบร้อย ✅');
      closeModal();
      fetchSouvenirs(); 

    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('ยืนยันลบสินค้านี้?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/souvenirs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      fetchSouvenirs();
    } catch (error) { alert(error.message); }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, price: item.price, description: item.description || '', isAvailable: item.isAvailable });
      setFilePreview(item.image ? (item.image.startsWith('http') ? item.image : `${SOUVENIR_IMG_URL}/${item.image}`) : null);
    } else {
      setEditingItem(null);
      setFormData({ name: '', price: '', description: '', isAvailable: true });
      setFilePreview(null);
    }
    setFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setFile(null); setFilePreview(null); };

  const getImageUrl = (img) => {
      if (!img) return 'https://placehold.co/100?text=No+Image';
      return img.startsWith('http') ? img : `${SOUVENIR_IMG_URL}/${img}`;
  };

  return (
    <div className="w-full h-full pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* Header Dark Mode */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">จัดการของที่ระลึก 🎁</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">เพิ่ม ลบ หรือแก้ไขสินค้าในร้านค้า</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 dark:shadow-none">
          <Plus size={18} /> <span className="hidden sm:inline">เพิ่มสินค้า</span>
        </button>
      </div>

      {/* Table Container Dark Mode */}
      <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <table className="w-full text-left text-sm min-w-[600px] md:min-w-full">
          <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 uppercase">
            <tr>
              <th className="p-4 w-20">รูปภาพ</th>
              <th className="p-4 w-32 md:w-auto">ชื่อสินค้า</th>
              <th className="p-4 w-24">ราคา</th>
              <th className="p-4 w-auto">รายละเอียด</th>
              <th className="p-4 w-24 text-center">สถานะ</th>
              <th className="p-4 w-24 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm md:text-base">
            {souvenirs.map(item => (
              <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition bg-white dark:bg-slate-900">
                <td className="p-4 align-top">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <img 
                        src={getImageUrl(item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => e.target.src = 'https://placehold.co/100?text=Error'}
                    />
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-800 dark:text-gray-100 align-top text-base"><div className="break-words">{item.name}</div></td>
                <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold align-top text-base whitespace-nowrap">{item.price.toLocaleString()}.-</td>
                <td className="p-4 text-gray-600 dark:text-gray-400 align-top">
                  <div className="whitespace-normal break-words leading-relaxed text-sm max-w-[200px] md:max-w-[250px] lg:max-w-xs xl:max-w-lg">
                    {item.description || '-'}
                  </div>
                </td>
                <td className="p-4 align-top text-center">
                  <span className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold inline-block whitespace-nowrap ${item.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{item.isAvailable ? 'พร้อมขาย' : 'ปิด'}</span>
                </td>
                <td className="p-4 text-center align-top">
                  <div className="flex flex-col md:flex-row justify-center gap-2">
                    <button onClick={() => openModal(item)} className="p-1.5 md:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 md:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {souvenirs.length === 0 && !loading && <tr><td colSpan="6" className="text-center py-8 text-gray-400 dark:text-slate-500">ยังไม่มีสินค้า</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] backdrop-blur-sm p-4" onClick={closeModal}>
            {/* Modal Box Dark Mode */}
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl max-w-lg w-full relative max-h-[85vh] overflow-y-auto border border-gray-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-slate-900 z-10 pb-2 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{editingItem ? 'แก้ไขสินค้า ✏️' : 'เพิ่มสินค้าใหม่ ✨'}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center">
                  <label className="relative cursor-pointer group">
                    <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-500 transition">
                      {filePreview ? <img src={filePreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-gray-400 dark:text-slate-500"><ImageIcon size={32} className="mx-auto mb-1" /><span className="text-xs">เลือกรูป</span></div>}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-md group-hover:scale-110 transition"><UploadCloud size={16} /></div>
                  </label>
                </div>
                
                {/* Inputs Dark Mode */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">ชื่อสินค้า</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">ราคา</label>
                    <input required type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">สถานะ</label>
                    <select value={formData.isAvailable} onChange={e => setFormData({ ...formData, isAvailable: e.target.value === 'true' })} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-gray-900 dark:text-white">
                        <option value="true">🟢 พร้อมขาย</option>
                        <option value="false">🔴 ปิดการขาย</option>
                    </select>
                  </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">รายละเอียด</label>
                    <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 resize-none text-gray-900 dark:text-white" />
                </div>
                
                <button type="submit" disabled={uploading} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition flex justify-center items-center gap-2 ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none'}`}>{uploading ? 'กำลังบันทึก...' : (editingItem ? 'บันทึก' : 'เพิ่มสินค้า')}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SouvenirManagement;