// src/layouts/MainLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, ShieldCheck, History, Ticket, ChevronRight, AlertCircle, Loader2, UserCog } from 'lucide-react'; 
import CartSidebar from '../pages/CartSidebar';
import ctcLogo from '../assets/ctc_home_coming.svg';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL } from '../config';
import SessionExpiredToast from '../components/SessionExpiredToast';
import PaymentAlertToast from '../components/PaymentAlertToast';

// --- Helper สำหรับเช็ค Token ---
const checkTokenValidity = () => {
  const token = localStorage.getItem('token');
  if (!token) return { valid: false, reason: 'no-token' };
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const decoded = JSON.parse(jsonPayload);
    if (decoded.exp * 1000 < Date.now()) return { valid: false, reason: 'expired' };
    return { valid: true, role: decoded.user.role };
  } catch (error) {
    return { valid: false, reason: 'invalid' };
  }
};

const MainLayout = () => {
  const { config } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.toLowerCase(); 
  const { clearCart } = useCart();
  
  const boxedPages = ['/dashboard', '/profile'];
  const isBoxedPage = boxedPages.some(page => path.startsWith(page));
  const isDashboard = path.includes('/dashboard');

  const [role, setRole] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false); 
  const [userAvatar, setUserAvatar] = useState(null);

  // State สำหรับ Badges
  const [badges, setBadges] = useState({ bookings: 0, orders: 0 });

  // State สำหรับ Toast ถามจ่ายเงิน
  const [alertState, setAlertState] = useState({
      show: false,
      url: '/my-orders' 
  });
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(''); 
  const mainScrollRef = useRef(null);
  const isManualScroll = useRef(false);

  // ฟังก์ชันดึงจำนวนแจ้งเตือน
  const fetchBadges = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
          // 1. Booking (ยิงไปที่ /bookings/my ตาม Route ที่ถูกต้อง)
          const resBooking = await fetch(`${API_BASE_URL}/bookings/my`, { 
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          let pendingBookings = 0;
          if (resBooking.ok) {
              const bookings = await resBooking.json();
              pendingBookings = Array.isArray(bookings) ? bookings.filter(b => b.status === 'pending').length : 0;
          }

          // 2. Order
          const resOrder = await fetch(`${API_BASE_URL}/orders/my-orders`, { 
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          let pendingOrders = 0;
          if (resOrder.ok) {
              const orders = await resOrder.json();
              pendingOrders = Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0;
          }

          setBadges({ bookings: pendingBookings, orders: pendingOrders });

      } catch (error) {
          console.error("Failed to fetch badges", error);
      }
  };

  useEffect(() => {
    const checkUser = () => {
        const status = checkTokenValidity();
        if (status.valid) {
            setRole(status.role);
            setSessionExpired(false);
            fetchUserAvatar();
            fetchBadges(); 
        } else {
            setRole(null);
            if (localStorage.getItem('token') && path !== '/auth') {
                handleSessionExpired();
            }
        }
    };
    checkUser();

    const interval = setInterval(() => {
        if(localStorage.getItem('token')) fetchBadges();
    }, 30000);
    return () => clearInterval(interval);

  }, [location]);

 useEffect(() => {
    const handleOrderCreated = (event) => {
        // ✅✅✅ เพิ่มการดักจับตรงนี้ครับ ✅✅✅
        // ถ้ามีการส่ง status มา และสถานะนั้น "ไม่ใช่" pending -> ไม่ต้องแสดง Popup
        if (event.detail?.status && event.detail.status !== 'pending') {
            fetchBadges(); // อัปเดตตัวเลขอย่างเดียวพอ
            return; 
        }
        // ------------------------------------

        fetchBadges(); 
        
        const targetUrl = (event.detail && event.detail.url) ? event.detail.url : '/my-orders';
        
        setAlertState({
            show: true,
            url: targetUrl
        });
    };

    window.addEventListener('ORDER_CREATED', handleOrderCreated);
    return () => window.removeEventListener('ORDER_CREATED', handleOrderCreated);
  }, []);

  const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; 
    };

  const fetchUserAvatar = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
          const res = await fetch(`${API_BASE_URL}/users/profile`, { 
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              if (data.avatar) {
                  const avatarUrl = data.avatar.startsWith('http') 
                      ? data.avatar 
                      : `${API_BASE_URL.replace('/api', '')}/uploads/avatars/${data.avatar}`;
                  setUserAvatar(`${avatarUrl}?t=${new Date().getTime()}`);
              }
          }
      } catch (error) {
          console.error("Error fetching avatar:", error);
      }
  };

  const handleSessionExpired = () => {
      setSessionExpired(true);
      localStorage.removeItem('token'); 
      clearCart(); 
      setTimeout(() => {
          window.location.href = '/auth';
      }, 10000);
  };

  useEffect(() => {
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition && mainScrollRef.current) {
        mainScrollRef.current.style.scrollBehavior = 'auto';
        mainScrollRef.current.scrollTop = parseInt(savedPosition);
        setTimeout(() => {
            if (mainScrollRef.current) mainScrollRef.current.style.scrollBehavior = 'smooth';
        }, 100);
    }
    const handleBeforeUnload = () => {
        if (mainScrollRef.current) sessionStorage.setItem('scrollPosition', mainScrollRef.current.scrollTop);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (path !== '/' && path !== '/indextest') {
        setActiveSection('');
        setIsScrolled(true); 
        return;
    }
    const handleScroll = () => {
      if (mainScrollRef.current) {
        setIsScrolled(mainScrollRef.current.scrollTop > 10);
        if (isManualScroll.current) return;
        const scrollPosition = mainScrollRef.current.scrollTop + 200; 
        const sections = ['top', 'agenda', 'gallery', 'booking-section', 'faq', 'contact'];
        let foundSection = '';
        for (const sectionId of sections) {
            const element = document.getElementById(sectionId);
            if (element) {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;
                if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
                    foundSection = sectionId;
                }
            }
        }
        if (foundSection) setActiveSection(foundSection);
      }
    };
    const scrollContainer = mainScrollRef.current;
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);
    return () => { if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll); };
  }, [path]); 

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    if (path !== '/' && path !== '/indextest') {
        navigate('/');
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                isManualScroll.current = true;
                setActiveSection(id);
                element.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => isManualScroll.current = false, 1000);
            }
        }, 100);
    } else {
        const element = document.getElementById(id);
        if (element) {
            isManualScroll.current = true;
            setActiveSection(id);
            element.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => isManualScroll.current = false, 1000);
        } else if (id === 'top' && mainScrollRef.current) {
            mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveSection('top');
        }
    }
  };

  const showLogo = config?.branding?.showLogo ?? true;
  const showSiteName = config?.branding?.showSiteName ?? true;
  const siteName = config?.branding?.siteName || "CTC HOMECOMING";
  const showBooking = config?.system?.booking;
  const showShop = config?.system?.purchasing;

  const getLogoUrl = () => {
      const dbLogo = config?.branding?.logo;
      if (dbLogo) {
          if (dbLogo.startsWith('http') || dbLogo.startsWith('blob:')) return dbLogo;
          const serverUrl = API_BASE_URL.replace('/api', '');
          return `${serverUrl}/uploads/site/photos/${dbLogo}`;
      }
      return ctcLogo;
  };

  const desktopMenuItems = [
      { id: 'top', label: 'หน้าแรก', show: true },
      { id: 'agenda', label: 'กำหนดการ', show: config?.agenda?.show },
      { id: 'gallery', label: 'ภาพบรรยากาศ', show: config?.gallery?.show },
      { id: 'booking-section', label: 'จองโต๊ะ', show: showBooking },
      { id: 'faq', label: 'FAQ', show: config?.faq?.show },
  ].filter(item => item.show !== false);

  return (
    <>
      <style>{`
        html, body, #root { height: 100vh !important; width: 100vw !important; overflow: hidden !important; margin: 0; padding: 0; }
      `}</style>
      
      {sessionExpired && <SessionExpiredToast onRedirect={() => window.location.href = '/auth'} />}

      {/* Toast แจ้งเตือนเมื่อสั่งซื้อ/จองเสร็จ */}
     {alertState.show && (
        <PaymentAlertToast 
            onClose={() => setAlertState(prev => ({ ...prev, show: false }))} 
            onPay={() => { 
                setAlertState(prev => ({ ...prev, show: false })); 
                navigate(alertState.url); 
            }} 
        />
      )}

      <div ref={mainScrollRef} className="h-screen w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950 font-sans relative flex flex-col scroll-smooth transition-colors duration-300">
        <CartSidebar />

        {!isDashboard && (
           <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm py-2 lg:py-3 border-slate-200/50 dark:border-slate-800/50' : 'bg-gradient-to-b from-white/60 to-transparent dark:from-slate-900/60 py-4 lg:py-5 border-transparent'}`} style={{ width: '100%' }}>
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center">
              
              <button onClick={() => scrollToSection('top')} className="flex items-center gap-2 group shrink-0 transition-transform active:scale-95">
                  {showLogo && (
                      <img src={getLogoUrl()} alt="Logo" className="w-9 h-9 lg:w-11 lg:h-11 object-contain drop-shadow-sm" onError={(e) => {if (e.target.src !== ctcLogo) { e.target.src = ctcLogo; } else { e.target.style.display='none'; }}} />
                  )}
                  <span className={`${showLogo ? 'hidden' : (showSiteName ? 'flex' : 'hidden')} items-center text-2xl text-slate-900 dark:text-white`}>🏠</span>
                  {showSiteName && (
                      <div className="flex flex-col items-start leading-none">
                          <span className={`font-black text-lg lg:text-2xl tracking-tight transition-colors duration-300 ${isScrolled ? 'text-slate-800 dark:text-white' : 'text-slate-900 dark:text-white'} group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase`}>
                              {siteName}
                          </span>
                      </div>
                  )}
              </button>

              <div className="hidden lg:flex items-center gap-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-full border border-white/30 dark:border-slate-700/30 shadow-sm mx-4">
                  {desktopMenuItems.map((item) => (
                      <button 
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                              activeSection === item.id 
                                ? 'text-slate-900 bg-white shadow-sm dark:bg-slate-700 dark:text-white' 
                                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                          }`}
                      >
                          {item.label}
                          {activeSection === item.id && (<span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1/3 h-[3px] bg-yellow-400 rounded-full"></span>)}
                      </button>
                  ))}
                  
                  {showShop && (
                      <>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <Link to="/SouvenirShop" className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap group ${path === '/souvenirshop' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-inner' : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-200'}`}>
                            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" /> 
                            <span>ของที่ระลึก</span>
                        </Link>
                      </>
                  )}
              </div>

              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                  {role && (
                    <>
                        {/* 🟢 ส่วนการจอง (MyBookings) สำหรับ PC */}
                        {showBooking && (
                            <>
                                <Link to="/MyBookings" className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition shadow-sm relative ${path === '/mybookings' ? 'bg-blue-600 text-white' : 'bg-white/80 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                                    <Ticket size={18} /> 
                                    <span>การจอง</span>
                                    
                                    {/* ✅✅✅ ย้ายมาไว้ตรงนี้ (มุมขวาบนของปุ่ม) ✅✅✅ */}
                                    {badges.bookings > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 font-bold shadow-sm">
                                            {badges.bookings}
                                        </span>
                                    )}
                                </Link>

                                {/* ส่วน Mobile (ไม่ต้องแก้ เพราะเป็นปุ่มกลมอยู่แล้ว) */}
                                <Link to="/MyBookings" className={`flex lg:hidden w-9 h-9 rounded-full items-center justify-center transition-all relative ${path === '/mybookings' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm'}`}>
                                    <Ticket size={18} />
                                    {badges.bookings > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ring-1 ring-white dark:ring-slate-900">
                                            {badges.bookings}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}
                        
                        {/* 🟢 ส่วนคำสั่งซื้อ (Orders) - อันนี้สวยอยู่แล้ว */}
                        {showShop && (
                            <Link 
                                to="/my-orders" 
                                title="ประวัติการซื้อ" 
                                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all relative ${path === '/my-orders' ? 'bg-emerald-600 text-white shadow-md' : (isScrolled ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400' : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 shadow-sm')}`}
                            >
                                <History size={18} />
                                {badges.orders > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 font-bold shadow-sm">
                                        {badges.orders}
                                    </span>
                                )}
                            </Link>
                        )}
                    </>
                  )}

                  {(role === 'admin' || role === 'officer') && (
                    <Link to="/Dashboard" className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition shadow-lg shadow-slate-200 dark:shadow-none">
                      <ShieldCheck size={16} /> <span className="hidden lg:inline">Admin Panel</span>
                    </Link>
                  )}

                  {!role ? (
                    <Link to="/auth" className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-xs lg:text-sm whitespace-nowrap">
                      <User size={16} /> <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                    </Link>
                  ) : (
                    <>
                        <Link 
                            to="/profile" 
                            className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all overflow-hidden border-2 
                            ${path === '/profile' ? 'border-violet-600 shadow-md ring-2 ring-violet-200' : 'border-transparent hover:border-violet-300'}
                            ${!userAvatar && (isScrolled ? 'bg-slate-100 dark:bg-slate-800 text-slate-600' : 'bg-white/80 dark:bg-slate-800 text-slate-700')}`}
                        >
                            {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <UserCog size={18} />}
                        </Link>

                        <button onClick={() => { clearCart(); localStorage.removeItem('token'); window.location.href = '/auth'; }} className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all ${isScrolled ? 'bg-red-50 text-red-500' : 'bg-white/80 text-red-500'}`} title="ออกจากระบบ">
                            <LogOut size={18} />
                        </button>
                    </>
                  )}

                  <button className="lg:hidden p-2 text-slate-700 bg-white/50 rounded-full" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className={`lg:hidden absolute top-full left-0 w-full border-b shadow-2xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 z-40 rounded-b-3xl transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50' : 'bg-white/30 dark:bg-slate-900/50 backdrop-blur-2xl border-white/20'}`}>
                    {desktopMenuItems.map((item) => (
                        <button key={item.id} onClick={() => scrollToSection(item.id)} className="p-4 text-left font-bold rounded-2xl flex justify-between items-center group transition-colors text-slate-800 dark:text-slate-200 hover:bg-white/50">
                            <span className="flex items-center gap-3">{item.label}</span>
                        </button>
                    ))}
                    
                    {role && showShop && (
                        <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="p-4 text-left font-bold rounded-2xl flex justify-between items-center group transition-colors text-slate-800 dark:text-slate-200 hover:bg-emerald-50/50">
                            <span className="flex items-center gap-3"><History size={18} /> ประวัติการซื้อ</span>
                            {badges.orders > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{badges.orders}</span>}
                        </Link>
                    )}
                </div>
            )}
         </nav>
        )}
        <main className={!isBoxedPage ? 'w-full pt-0 flex-1' : 'pt-24 p-6 max-w-7xl mx-auto flex-1'}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default MainLayout;