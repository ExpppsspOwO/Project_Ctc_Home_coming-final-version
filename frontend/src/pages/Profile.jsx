// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Mail, Lock, Save, Moon, Sun, 
  Camera, Loader2, AlertCircle, Upload, Check 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

const PRESET_AVATARS = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png'];

const Profile = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // ข้อมูลผู้ใช้
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    avatar: PRESET_AVATARS[0] 
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const getFullImageUrl = (avatarName) => {
    if (!avatarName) return null;
    if (avatarName.startsWith('http')) return avatarName;
    return `${API_BASE_URL.replace('/api', '')}/uploads/avatars/${avatarName}`;
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          username: data.username || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'user',
          avatar: data.avatar || PRESET_AVATARS[0]
        });
        setPreviewImage(getFullImageUrl(data.avatar || PRESET_AVATARS[0]));
      }
    } catch (error) { console.error(error); }
  };

  const handleAvatarSelect = (filename) => {
    setFormData({ ...formData, avatar: filename });
    setPreviewImage(getFullImageUrl(filename));
    setSelectedFile(null); 
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      addToast('รหัสผ่านไม่ตรงกัน', 'error');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      let uploadedAvatarUrl = formData.avatar;
      
      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append('avatar', selectedFile);
        const uploadRes = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: imageFormData
        });
        if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedAvatarUrl = uploadData.filename; 
        }
      }

      const payload = { ...formData, avatar: uploadedAvatarUrl };
      if (passwords.newPassword) payload.password = passwords.newPassword;

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');

      addToast('บันทึกข้อมูลเรียบร้อย ✅', 'success');
      setPasswords({ newPassword: '', confirmPassword: '' });
      window.location.reload(); 
      
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 pt-4 lg:pt-8 transition-colors duration-300">
      
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 transition-colors">บัญชีของฉัน 👤</h1>
        <p className="text-slate-500 dark:text-slate-400 transition-colors">จัดการข้อมูลส่วนตัวและรูปโปรไฟล์</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Left Column: Avatar & Theme --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center transition-all duration-300">
            
            {/* รูปใหญ่ */}
            <div className="relative w-40 h-40 mb-6 group">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-600 shadow-xl bg-slate-100 dark:bg-slate-700">
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
                    <div className="text-white flex flex-col items-center">
                        <Camera size={32} />
                        <span className="text-xs font-bold mt-1">เปลี่ยนรูป</span>
                    </div>
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </label>
            </div>

            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm">เลือกรูปประจำตัว</h3>
            
            {/* Grid เลือกรูป */}
            <div className="flex gap-2 justify-center mb-4 flex-wrap">
                {PRESET_AVATARS.map((fileName, index) => (
                    <button 
                        key={index}
                        type="button"
                        onClick={() => handleAvatarSelect(fileName)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${formData.avatar === fileName ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900 scale-110' : 'border-transparent'}`}
                    >
                        <img src={getFullImageUrl(fileName)} className="w-full h-full object-cover" alt={`Avatar ${index + 1}`} />
                    </button>
                ))}
            </div>
            
            <label className="mt-1 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline">
                <Upload size={16} /> อัปโหลดจากเครื่อง
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          {/* Theme Toggle */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all duration-300">
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-amber-100 text-amber-600'}`}>
                    {isDark ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">โหมดกลางคืน</span>
             </div>
             <button onClick={toggleTheme} className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all duration-300 ${isDark ? 'left-[calc(100%-20px)]' : 'left-1'}`} />
              </button>
          </div>
        </div>

        {/* --- Right Column: Edit Form --- */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-8 transition-all duration-300">
            
            {/* 1. ข้อมูลส่วนตัว */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <User className="text-blue-500" size={20} /> ข้อมูลส่วนตัว
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Username</label>
                        <input type="text" value={formData.username} readOnly className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 border-0 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">ชื่อ-นามสกุล</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-slate-800 dark:text-white transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">เบอร์โทรศัพท์</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-slate-800 dark:text-white transition-colors" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">อีเมล</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-slate-800 dark:text-white transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. ความปลอดภัย */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <Lock className="text-blue-500" size={20} /> ความปลอดภัย
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">รหัสผ่านใหม่</label>
                        <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-500 transition-colors" placeholder="••••••" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">ยืนยันรหัสผ่านใหม่</label>
                        <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} disabled={!passwords.newPassword} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-slate-800 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed placeholder-slate-300 dark:placeholder-slate-500 transition-colors" placeholder="••••••" />
                        {passwords.newPassword && passwords.newPassword !== passwords.confirmPassword && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-bold animate-pulse"><AlertCircle size={12} /> รหัสผ่านไม่ตรงกัน</p>
                        )}
                        {passwords.newPassword && passwords.newPassword === passwords.confirmPassword && (
                            <p className="text-emerald-500 text-xs mt-2 flex items-center gap-1 font-bold"><Check size={12} /> รหัสผ่านตรงกัน</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition active:scale-95 flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> บันทึกการเปลี่ยนแปลง</>}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;