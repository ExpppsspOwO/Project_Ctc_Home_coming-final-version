import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const spring = {
    type: "spring",
    stiffness: 70,
    damping: 15
  };

  const textVariant = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    // ✅ เพิ่ม dark:bg-slate-950
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden bg-center bg-cover transition-colors duration-300">
      <Link to="/" className="absolute top-6 left-6 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold flex items-center gap-2 z-50">
       ⬅ กลับหน้าแรก
      </Link>

      {/* ✅ ปรับกล่องหลัก dark:bg-slate-800 */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl relative overflow-hidden w-full max-w-[900px] min-h-[600px] flex transition-colors duration-300">

        {/* --- 1. Login Form (ซ้าย) --- */}
        <div className={`w-1/2 h-full absolute top-0 left-0 transition-all duration-500 ${isLoginView ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <LoginForm />
        </div>

        {/* --- 2. Register Form (ขวา) --- */}
         <div className={`w-1/2 h-full absolute top-0 left-1/2 transition-all duration-500 ${!isLoginView ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <RegisterForm switchToLogin={() => setIsLoginView(true)} />
        </div>

        {/* --- 3. Sliding Panel (แผ่นสีฟ้า) --- */}
        <motion.div
          initial={false}
          animate={{ x: isLoginView ? '100%' : '0%' }}
          transition={spring}
          // ✅ ปรับสี Gradient ให้เข้มขึ้นนิดหน่อยในโหมดมืดเพื่อให้ตัวหนังสืออ่านง่าย
          className="w-1/2 h-full absolute top-0 left-0 bg-gradient-to-br from-blue-600/85 to-blue-400/85 dark:from-blue-800/90 dark:to-blue-600/90 text-white z-20 flex items-center justify-center rounded-[2rem] backdrop-blur-sm"
        >
          <div className="text-center p-10 w-full">
            <AnimatePresence mode="wait">
              {isLoginView ? (
                  <motion.div
                      key="signup-text"
                      variants={textVariant}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                  >
                      <h2 className="text-3xl font-bold mb-4">ยังไม่มีบัญชี?</h2>
                      <p className="mb-8 text-blue-50">สมัครสมาชิกเพื่อเริ่มจองโต๊ะงานคืนสู่เหย้าได้เลย!</p>
                      <button
                          onClick={() => setIsLoginView(false)}
                          className="py-3 px-8 border-2 border-white/70 rounded-full font-bold hover:bg-white hover:text-blue-600 dark:hover:text-blue-800 transition"
                      >
                          สมัครสมาชิก (SIGN UP)
                      </button>
                   </motion.div>
              ) : (
                  <motion.div
                       key="signin-text"
                       variants={textVariant}
                       initial="hidden"
                       animate="visible"
                       exit="exit"
                  >
                      <h2 className="text-3xl font-bold mb-4">มีบัญชีแล้ว?</h2>
                      <p className="mb-8 text-blue-50">ถ้าคุณเคยสมัครแล้ว กดปุ่มด้านล่างเพื่อเข้าสู่ระบบ</p>
                      <button
                          onClick={() => setIsLoginView(true)}
                          className="py-3 px-8 border-2 border-white/70 rounded-full font-bold hover:bg-white hover:text-blue-600 dark:hover:text-blue-800 transition"
                      >
                          เข้าสู่ระบบ (SIGN IN)
                      </button>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AuthPage;