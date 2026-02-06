import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus, Eye, EyeOff, Save, X, ShieldAlert, AlertTriangle, Search } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useToast } from '../../context/ToastContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ เพิ่ม State สำหรับค้นหา
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // 🔥 Modal State (Delete Confirmation)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
  
  // Password Visibility
  const [showPasswords, setShowPasswords] = useState({});

  // Form Data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '', 
    email: '',
    role: 'user'
  });

  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- API Functions ---
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error(error);
      addToast('โหลดข้อมูลผู้ใช้ไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      let url = `${API_BASE_URL}/users`; 
      let method = 'POST';

      if (editingUser) {
        url = `${API_BASE_URL}/users/${editingUser._id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'บันทึกไม่สำเร็จ');

      addToast(editingUser ? 'แก้ไขข้อมูลเรียบร้อย ✅' : 'เพิ่มผู้ใช้ใหม่เรียบร้อย 🎉', 'success');
      closeModal();
      fetchUsers();

    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleDeleteClick = (userId) => {
    setDeleteModal({ isOpen: true, userId });
  };

  const confirmDeleteUser = async () => {
    const { userId } = deleteModal;
    if (!userId) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('ลบไม่สำเร็จ');

      addToast('ลบผู้ใช้งานเรียบร้อย 🗑️', 'success');
      setUsers(prev => prev.filter(u => u._id !== userId));
      setDeleteModal({ isOpen: false, userId: null });

    } catch (error) {
      addToast(error.message, 'error');
      setDeleteModal({ isOpen: false, userId: null });
    }
  };

  // --- Helper Functions ---
  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        username: user.username || '',
        password: user.password || '',
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'user'
      });
    } else {
      setFormData({ username: '', password: '', name: '', phone: '', email: '', role: 'user' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // ✅ Logic การกรองข้อมูล (Filter Users)
  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
        user.username.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.phone || '').includes(term)
    );
  });

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400 animate-pulse">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="w-full pb-20">
      
      {/* Header Section with Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          จัดการผู้ใช้งาน 👥
        </h2>
        
        <div className="flex gap-3 w-full md:w-auto">
            {/* ✅ ช่องค้นหา */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อ, username..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none shadow-sm placeholder-gray-400"
                />
            </div>

            {/* ปุ่มเพิ่ม */}
            <button 
            onClick={() => openModal()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-200 dark:shadow-none flex items-center gap-2 transition-transform active:scale-95 text-sm whitespace-nowrap"
            >
            <Plus size={18} /> เพิ่มผู้ใช้
            </button>
        </div>
      </div>

      {/* Table Container Dark Mode */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm uppercase font-bold tracking-wide">
              <tr>
                <th className="p-4 border-b dark:border-slate-700 w-12 text-center">#</th>
                <th className="p-4 border-b dark:border-slate-700">Username</th>
                <th className="p-4 border-b dark:border-slate-700 text-red-600 dark:text-red-400 hidden lg:table-cell">
                   <div className="flex items-center gap-1">Password <ShieldAlert size={14} /></div>
                </th>
                <th className="p-4 border-b dark:border-slate-700 hidden md:table-cell">ชื่อ-นามสกุล</th>
                <th className="p-4 border-b dark:border-slate-700 hidden lg:table-cell">Email</th>
                <th className="p-4 border-b dark:border-slate-700 text-center sm:text-left">Role</th>
                <th className="p-4 border-b dark:border-slate-700 text-center min-w-[100px]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {/* ✅ ใช้ filteredUsers แทน users ปกติ */}
              {filteredUsers.length === 0 ? (
                 <tr><td colSpan="7" className="text-center py-10 text-gray-400 dark:text-slate-500">ไม่พบข้อมูลที่ค้นหา</td></tr>
              ) : (
                filteredUsers.map((user, index) => (
                    <tr key={user._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition bg-white dark:bg-slate-900">
                    <td className="p-4 text-center text-gray-400 dark:text-slate-500 font-medium">{index + 1}</td>

                    <td className="p-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {user.username}
                        <div className="md:hidden text-xs text-gray-400 dark:text-slate-500 font-sans mt-0.5 font-normal">
                        {user.name}
                        </div>
                    </td>
                    
                    <td className="p-4 font-mono text-sm relative group hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                        <span className={showPasswords[user._id] ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-slate-500'}>
                            {showPasswords[user._id] ? (user.password || 'N/A') : '••••••••'}
                        </span>
                        <button 
                            onClick={() => togglePasswordVisibility(user._id)}
                            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none"
                        >
                            {showPasswords[user._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        </div>
                    </td>

                    <td className="p-4 text-gray-700 dark:text-slate-300 hidden md:table-cell">{user.name}</td>
                    <td className="p-4 text-gray-500 dark:text-slate-400 text-sm hidden lg:table-cell">{user.email || '-'}</td>
                    
                    <td className="p-4 text-center sm:text-left">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider
                        ${user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' : 
                          user.role === 'officer' 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
                            'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}>
                        {user.role}
                        </span>
                    </td>
                    
                    <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => openModal(user)} 
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                            title="แก้ไข"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(user._id)} 
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                            title="ลบ"
                        >
                            <Trash2 size={16} />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modal (Add/Edit) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} 
              onClick={e => e.stopPropagation()} 
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative border border-gray-100 dark:border-slate-800"
            >
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"><X size={24} /></button>
              
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                {editingUser ? <><Edit2 className="text-blue-600 dark:text-blue-400" /> แก้ไขข้อมูลผู้ใช้</> : <><Plus className="text-blue-600 dark:text-blue-400" /> เพิ่มผู้ใช้งานใหม่</>}
              </h3>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Username</label>
                    <input 
                      type="text" 
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none font-mono text-blue-700 dark:text-blue-400 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Password (Plain)</label>
                    <input 
                      type="text"
                      required={!editingUser}
                      placeholder={editingUser ? "เว้นว่างถ้าไม่เปลี่ยน" : ""}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-400 outline-none font-mono text-red-600 dark:text-red-400 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">ชื่อ-นามสกุล</label>
                        <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">เบอร์โทรศัพท์</label>
                        <input 
                        type="text" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">สิทธิ์การใช้งาน (Role)</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white"
                  >
                    <option value="user">User (ลูกค้าทั่วไป)</option>
                    <option value="officer">Officer (เจ้าหน้าที่)</option>
                    <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-gray-600 dark:text-slate-300 font-bold transition">
                    ยกเลิก
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none transition active:scale-95 flex justify-center items-center gap-2">
                    <Save size={18} /> บันทึก
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 🔥 Modal Confirm Delete --- */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-red-900/40 flex items-center justify-center z-[1100] backdrop-blur-sm p-4"
            onClick={() => setDeleteModal({ isOpen: false, userId: null })}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} 
              onClick={e => e.stopPropagation()} 
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-100 dark:border-red-900"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50 dark:border-red-900/50">
                  <AlertTriangle size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">ยืนยันการลบผู้ใช้?</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
                  คุณต้องการลบผู้ใช้งานรายนี้ใช่หรือไม่?<br/>
                  <span className="text-xs text-red-400 mt-1 block">(การกระทำนี้ไม่สามารถย้อนกลับได้)</span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, userId: null })}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-none transition active:scale-95"
                  >
                    ยืนยันลบ
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;