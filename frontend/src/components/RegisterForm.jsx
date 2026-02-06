import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';

// ✅ ShakeItem ยังคงใช้ Logic เดิม
const ShakeItem = ({ field, shakeFields, children, className }) => (
  <motion.div
    animate={shakeFields[field] ? { x: [-10, 10, -10, 10, 0] } : {}}
    transition={{ duration: 0.4 }}
    className={className}
  >
    {children}
  </motion.div>
);

const RegisterForm = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State สำหรับเช็ค Password
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const [shakeFields, setShakeFields] = useState({});
  const [error, setError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (!formData.password || !formData.confirmPassword) {
      setPasswordsMatch(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setPasswordsMatch(null);

    const timeoutId = setTimeout(() => {
      const isMatch = formData.password === formData.confirmPassword;
      setPasswordsMatch(isMatch);
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timeoutId);

  }, [formData.password, formData.confirmPassword]);


  const triggerShake = (fields) => {
    const newShakeMap = {};
    fields.forEach(field => newShakeMap[field] = true);
    setShakeFields(newShakeMap);
    setTimeout(() => setShakeFields({}), 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^\d*$/.test(value)) return;

    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.name) missingFields.push('name');
    if (!formData.username) missingFields.push('username');
    if (!formData.email) missingFields.push('email');
    if (!formData.phone) missingFields.push('phone');
    if (!formData.password) missingFields.push('password');
    if (!formData.confirmPassword) missingFields.push('confirmPassword');

    if (missingFields.length > 0) {
      triggerShake(missingFields);
      const msg = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
      setError(msg);
      addToast(msg, 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      triggerShake(['password', 'confirmPassword']);
      const msg = 'รหัสผ่านไม่ตรงกัน';
      setError(msg);
      addToast(msg, 'error');
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      addToast('สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน', 'success');
      switchToLogin();

    } catch (err) {
      let msg = err.message;
      if (msg.includes('exists') || msg.includes('Duplicate') || msg.includes('ซ้ำ')) {
        msg = '⚠️ ข้อมูลนี้ (ชื่อผู้ใช้, อีเมล หรือเบอร์โทร) ถูกใช้งานไปแล้ว';
        triggerShake(['username', 'email', 'phone']);
      }
      setError(msg);
      addToast(msg, 'error');
    }
  };

  // ✅ Helper Class สำหรับ Input (ใช้ร่วมกันหมดเพื่อให้แก้จุดเดียว)
  const getInputClass = (isError) => `
    w-full p-3 rounded-lg border outline-none transition-colors
    ${isError 
      ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100 placeholder-red-300' 
      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500'
    }
  `;

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="p-6 flex flex-col justify-center h-full text-center overflow-y-auto"
    >
      <h2 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">สร้างบัญชีใหม่</h2>
      <p className="text-gray-400 dark:text-slate-400 mb-4 text-sm">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-lg font-medium"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        
        <ShakeItem field="name" shakeFields={shakeFields}>
          <input type="text" name="name" placeholder="ชื่อ-นามสกุล" value={formData.name} onChange={handleChange} className={getInputClass(error && !formData.name)} />
        </ShakeItem>

        <div className="grid grid-cols-2 gap-3">
          <ShakeItem field="username" shakeFields={shakeFields}>
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className={getInputClass(error && !formData.username)} />
          </ShakeItem>
          <ShakeItem field="phone" shakeFields={shakeFields}>
            <input type="text" name="phone" placeholder="เบอร์โทรศัพท์" value={formData.phone} onChange={handleChange} className={getInputClass(error && !formData.phone)} />
          </ShakeItem>
        </div>

        <ShakeItem field="email" shakeFields={shakeFields}>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={getInputClass(error && !formData.email)} />
        </ShakeItem>

        <div className="relative">
          <ShakeItem field="password" shakeFields={shakeFields}>
            <input id="register-password" type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={getInputClass(error && !formData.password)} />
          </ShakeItem>
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition" tabIndex="-1">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <ShakeItem field="confirmPassword" shakeFields={shakeFields}>
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={getInputClass(
                (error && !formData.confirmPassword) || (passwordsMatch === false && !isChecking)
              )}
            />
          </ShakeItem>

          <div className="absolute right-3 top-3.5 flex items-center gap-2">
            {isChecking && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Loader2 size={18} className="text-blue-500 dark:text-blue-400" />
              </motion.div>
            )}
            {!isChecking && passwordsMatch !== null && (
              <>{passwordsMatch ? <CheckCircle size={18} className="text-green-500 dark:text-green-400" /> : <XCircle size={18} className="text-red-500 dark:text-red-400" />}</>
            )}
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition ml-1" tabIndex="-1">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button disabled={isChecking} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition mt-2 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm">
          {isChecking ? 'กำลังตรวจสอบ...' : 'SIGN UP'}
        </button>
      </form>
    </motion.div>
  );
};

export default RegisterForm;