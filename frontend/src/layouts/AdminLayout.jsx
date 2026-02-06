// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    Calendar, Users, LayoutGrid, Settings, LogOut,
    ChevronLeft, ChevronRight, Menu, X, Home, ShoppingBag, Package,
    ChevronDown, Table // ✅ 1. เพิ่มไอคอน Table
} from 'lucide-react';
import SessionExpiredToast from '../components/SessionExpiredToast';

const checkTokenValidity = () => {
  const token = localStorage.getItem('token');
  if (!token) return { valid: false, reason: 'no-token' };
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const decoded = JSON.parse(jsonPayload);

    if (decoded.exp * 1000 < Date.now()) {
        return { valid: false, reason: 'expired' };
    }
    return { valid: true, role: decoded.user.role };
  } catch (error) {
    return { valid: false, reason: 'invalid' };
  }
};

const MENU_GROUPS = [
    {
        title: 'EVENT MANAGEMENT',
        items: [
            { id: 'bookings', label: 'รายการจอง', icon: Calendar },
            { id: 'zones', label: 'สร้างผังที่นั่ง', icon: LayoutGrid }, // ✅ อันเดิม (ZoneGenerator) ยังอยู่
            { id: 'TableManager', label: 'จัดการข้อมูลโต๊ะ', icon: Table }, // ✅ 2. เพิ่มอันใหม่ (TableManager)
        ]
    },
    {
        title: 'SOUVENIR SHOP',
        items: [
            { id: 'souvenirs', label: 'จัดการของที่ระลึก', icon: ShoppingBag },
            { id: 'orders', label: 'รายการสั่งซื้อ', icon: Package },
        ]
    },
    {
        title: 'SYSTEM & USERS',
        items: [
            { id: 'users', label: 'จัดการผู้ใช้', icon: Users },
            { id: 'settings', label: 'ตั้งค่าเว็บไซต์', icon: Settings },
        ]
    }
];

const MenuGroup = ({ group, isCollapsed, activeTab, onMenuClick }) => {
    const hasActiveChild = group.items.some(item => item.id === activeTab);
    const [isOpen, setIsOpen] = useState(hasActiveChild);

    useEffect(() => {
        if (hasActiveChild) setIsOpen(true);
    }, [activeTab, hasActiveChild]);

    if (isCollapsed) {
        return (
            <div className="mb-2 border-b border-gray-100 dark:border-slate-800 pb-2 last:border-0">
                {group.items.map(item => (
                    <MenuItem
                        key={item.id} item={item} isCollapsed={true}
                        isActive={activeTab === item.id} onClick={onMenuClick}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
                <span>{group.title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {group.items.map(item => (
                            <MenuItem
                                key={item.id} item={item} isCollapsed={false}
                                isActive={activeTab === item.id} onClick={onMenuClick}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MenuItem = ({ item, isCollapsed, isActive, onClick }) => {
    const Icon = item.icon;
    return (
        <button
            onClick={() => onClick(item.id)}
            className={`relative w-full flex items-center gap-4 px-6 py-3 transition-all duration-200 group border-l-4 
      ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-600'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white border-transparent'
                }`}
        >
            <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300`} />
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm whitespace-nowrap font-medium"
                    >
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
};

const MenuList = ({ isCollapsed, activeTab, onMenuClick, onLogout, onNavigate }) => (
    <nav className="flex flex-col w-full mt-4 pb-4">
        {MENU_GROUPS.map((group, index) => (
            <MenuGroup
                key={index} group={group} isCollapsed={isCollapsed}
                activeTab={activeTab} onMenuClick={onMenuClick}
            />
        ))}
        <div className="mt-auto pt-4 pb-2 border-t border-gray-100 dark:border-slate-800">
            <button onClick={() => window.location.href = '/'} className="relative w-full flex items-center gap-4 px-6 py-4 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent transition-all duration-200 group">
                <Home className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium">กลับหน้าหลัก</motion.span>}
            </button>
            <button onClick={onLogout} className="relative w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-l-4 border-transparent transition-all duration-200 group">
                <LogOut className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!isCollapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium">ออกจากระบบ</motion.span>}
            </button>
        </div>
    </nav>
);

const AdminDashboard = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const [sessionExpired, setSessionExpired] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
    
    // ดึง active tab จาก URL (ถ้าเข้า /dashboard/TableManager -> activeTab = TableManager)
    const activeTab = location.pathname.split('/').pop() || 'bookings';

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);

            if (width >= 1024) setIsDesktopSidebarOpen(true);
            if (width >= 768 && width < 1024) setIsDesktopSidebarOpen(false);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuClick = (tabId) => {
        navigate(tabId); 
        if (window.innerWidth < 768) setIsMobileMenuOpen(false);
        if (window.innerWidth >= 768 && window.innerWidth < 1024) setIsDesktopSidebarOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth');
    };

    const handleSessionExpired = () => {
        if (sessionExpired) return;
        setSessionExpired(true);
        localStorage.removeItem('token'); 
    };

    useEffect(() => {
        const validate = () => {
             if (localStorage.getItem('token')) {
                 const status = checkTokenValidity();
                 if (!status.valid) {
                     handleSessionExpired();
                 }
             }
        };

        validate(); 

        const interval = setInterval(validate, 60000); 
        return () => clearInterval(interval);
    }, [location]);

    const getPageTitle = () => {
        const allItems = MENU_GROUPS.flatMap(g => g.items);
        const found = allItems.find(i => i.id === activeTab);
        return found ? found.label : 'Dashboard';
    };

    return (
        <div className="h-screen w-full bg-gray-100 dark:bg-slate-950 flex overflow-hidden relative transition-colors duration-300">
            
            {sessionExpired && <SessionExpiredToast onRedirect={() => window.location.href = '/auth'} />}

            {/* 1. Mobile Navbar */}
            <div className="md:hidden bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-40 h-16">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">CTC</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white text-lg">Admin Panel</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition">
                    <Menu className="w-6 h-6 text-gray-600 dark:text-slate-300" />
                </button>
            </div>

            {/* 2. Mobile Sidebar & Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/20 z-50 md:hidden backdrop-blur-[2px]" />
                        <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="fixed inset-y-0 left-0 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 md:hidden flex flex-col border-r border-gray-100 dark:border-slate-800">
                            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold">CTC</span>
                                    </div>
                                    <h2 className="font-bold text-gray-900 dark:text-white">CTC Admin</h2>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                                    <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <MenuList isCollapsed={false} activeTab={activeTab} onMenuClick={handleMenuClick} onLogout={handleLogout} onNavigate={navigate} />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* 3. Tablet Overlay */}
            <AnimatePresence>
                {isTablet && isDesktopSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsDesktopSidebarOpen(false)}
                        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px] hidden md:block lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* 4. Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isDesktopSidebarOpen ? 280 : 80 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`hidden md:flex flex-col border-r border-gray-200 dark:border-slate-800 h-full fixed top-0 left-0 z-50 shadow-sm overflow-hidden bg-white dark:bg-slate-900`}
            >
                <div className="h-20 flex items-center justify-center border-b border-gray-100 dark:border-slate-800 shrink-0 px-6">
                    {isDesktopSidebarOpen ? (
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-white font-bold">CTC</span>
                            </div>
                            <div className="overflow-hidden">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                                    <h2 className="font-bold text-gray-900 dark:text-white whitespace-nowrap">CTC Admin</h2>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">Dashboard</p>
                                </motion.div>
                            </div>
                        </div>
                    ) : <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">CT</span></div>}
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <MenuList isCollapsed={!isDesktopSidebarOpen} activeTab={activeTab} onMenuClick={handleMenuClick} onLogout={handleLogout} onNavigate={navigate} />
                </div>
                <div className="p-0 border-t border-gray-200 dark:border-slate-800 shrink-0">
                    <button onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)} className="w-full flex items-center justify-center gap-2 px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
                        {isDesktopSidebarOpen ? <><ChevronLeft className="w-5 h-5" /><span className="text-sm font-medium">ย่อเมนู</span></> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </motion.aside>

            {/* 5. Main Content Area */}
            <motion.main
                initial={false}
                animate={{ marginLeft: window.innerWidth < 768 ? 0 : (window.innerWidth >= 768 && window.innerWidth < 1024 ? 80 : (isDesktopSidebarOpen ? 280 : 80)) }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex-1 h-full flex flex-col overflow-hidden"
            >
                <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
                    <div className="pt-16 md:pt-0 max-w-[1920px] mx-auto min-h-[calc(100vh-100px)]">
                        <div className="mb-4 md:mb-6 mt-2 md:mt-0">
                            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">{getPageTitle()}</h1>
                            <p className="text-xs text-gray-500 dark:text-slate-400">จัดการข้อมูลระบบหลังบ้าน</p>
                        </div>

                        <div className="w-full">
                            <Outlet />
                        </div>

                    </div>
                </div>
            </motion.main>
        </div>
    );
};

export default AdminDashboard;