import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './index.css'
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext'; // ✅ 1. Import มาแล้ว
import { ConfigProvider } from './context/ConfigContext'
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ 2. ต้องครอบ CartProvider ไว้ตรงนี้ด้วย ระบบตะกร้าถึงจะทำงาน */}
    <ToastProvider>
      <ConfigProvider>
        <CartProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </CartProvider>
      </ConfigProvider>
    </ToastProvider>
  </React.StrictMode>,
)