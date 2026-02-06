import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(''); 
  const { addToast } = useToast();
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      
      addToast(`ยินดีต้อนรับกลับครับคุณ ${data.user.username}! 🎉`, 'success');
      
      setTimeout(() => {
        navigate('/'); 
      }, 500); 

    } catch (err) {
      setError(err.message); 
      addToast(err.message || 'เข้าสู่ระบบไม่สำเร็จ', 'error');
    }
  };

  // Helper สำหรับ Input Class
  const inputClass = (isError) => `
    w-full p-3 rounded-lg border outline-none transition-colors
    ${isError 
      ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100 placeholder-red-300' 
      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500'
    }
  `;

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="p-10 flex flex-col justify-center h-full text-center"
    >
      <h2 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">เข้าสู่ระบบ</h2>
      <p className="text-gray-400 dark:text-slate-400 mb-8">ใช้ Username หรือ Email เพื่อล็อกอิน</p>
      
      <form onSubmit={handleSubmit} className="space-y-4"> 
        <input
          type="text"
          name="identifier"
          placeholder="Username หรือ Email"
          value={formData.identifier}
          onChange={handleChange}
          className={inputClass(error)}
        />
        
        <div className="relative">
             <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass(error)}
            />
        </div>
        
        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-lg shadow transition mt-2">
          SIGN IN
        </button>
      </form>
    </motion.div>
  );
};

export default LoginForm;