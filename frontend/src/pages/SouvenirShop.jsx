// src/pages/SouvenirShop.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Search, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useConfig } from '../context/ConfigContext';
import ServiceUnavailable from '../components/ServiceUnavailable';

const SOUVENIR_IMG_URL = 'http://localhost:5000/uploads/souvenir_Img';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

// ✅ HeroBackground ใหม่: แสงสวย + ไม่แล็ค (ใช้ Gradient แทน Blur)
const HeroBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

        {/* 🟢 แสงเขียว (Emerald) - สื่อถึงการซื้อขาย/ร้านค้า */}
        <motion.div
            animate={{
                x: [-30, 30, -30],
                y: [-20, 20, -20],
                opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-15%] left-[-15%] w-[700px] h-[700px]"
            style={{
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(0,0,0,0) 70%)", // Emerald
                willChange: "transform, opacity"
            }}
        />

        {/* 🟣 แสงม่วง/คราม (Indigo) - สื่อถึงของพรีเมียม/ของที่ระลึก */}
        <motion.div
            animate={{
                x: [30, -30, 30],
                y: [20, -20, 20],
                opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[10%] right-[-10%] w-[600px] h-[600px]"
            style={{
                background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)", // Indigo
                willChange: "transform, opacity"
            }}
        />

        {/* Noise Texture แบบบางๆ */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
                backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
                backgroundRepeat: 'repeat',
            }}
        ></div>
    </div>
);

const SouvenirShop = () => {
    const { config, loading: configLoading } = useConfig();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const { addToCart } = useCart();
    const { addToast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            setQuantity(1);
        }
    }, [selectedProduct]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setFetchError(false);
            const res = await fetch(`${API_BASE_URL}/souvenirs`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setFetchError(true);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://placehold.co/600x400?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        return `${SOUVENIR_IMG_URL}/${imagePath}`;
    };

    const decreaseQty = () => { if (quantity > 1) setQuantity(prev => prev - 1); };
    const increaseQty = () => { setQuantity(prev => prev + 1); };

    const handleAddToCart = () => {
        if (!selectedProduct) return;

        const productToAdd = {
            ...selectedProduct,
            image: getImageUrl(selectedProduct.image)
        };
        addToCart(productToAdd, quantity);

        addToast(`เพิ่ม ${selectedProduct.name} ลงตะกร้าแล้ว`, 'success');
        setSelectedProduct(null);
        setQuantity(1);
    };

    if (!configLoading && config?.system && !config.system.purchasing) {
        return (
            <div className="relative w-full min-h-screen pb-24 overflow-x-hidden pt-32 bg-slate-50 dark:bg-slate-950 transition-colors">
                <HeroBackground />
                <ServiceUnavailable
                    title="ร้านค้าปิดให้บริการ"
                    message="ขออภัย ขณะนี้ระบบสั่งซื้อของที่ระลึกปิดให้บริการชั่วคราว"
                />
            </div>
        );
    }
    if (loading) return (
        <div className="flex justify-center items-center h-screen w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
            <HeroBackground />
            <div className="flex flex-col items-center gap-4 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
                <p className="text-slate-500 dark:text-slate-300 font-medium">กำลังโหลดสินค้า...</p>
            </div>
        </div>
    );

    if (fetchError) return <div className="text-center p-20 text-red-500 dark:text-red-400">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>;

    return (
        <div className="relative w-full min-h-screen pb-24 overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <HeroBackground />

            {/* --- Header Section --- */}
            <div className="relative z-10 pt-32 pb-12 md:pb-20 text-center px-4">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6 shadow-sm border border-emerald-100 dark:border-emerald-900/50 backdrop-blur-sm">
                        <ShoppingBag size={32} />
                    </div>
                    <span className="block mb-4">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-sm backdrop-blur-sm">
                            <Sparkles size={14} /> Official Merchandise
                        </span>
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white mb-4 tracking-tight drop-shadow-sm">
                        Souvenir Shop
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light">
                        เก็บความทรงจำสุดพิเศษกลับบ้าน ด้วยของที่ระลึกรุ่น Limited Edition <br className="hidden md:block" />
                        รายได้ส่วนหนึ่งมอบให้ทุนการศึกษารุ่นน้อง
                    </p>
                </motion.div>
            </div>

            {/* --- Product Grid --- */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                >
                    {products.map((item) => (
                        <motion.div
                            key={item._id}
                            variants={fadeInUp}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] p-4 pb-6 shadow-xl border border-slate-100 dark:border-slate-800 cursor-pointer group relative overflow-hidden transition-all hover:shadow-2xl hover:border-emerald-200 dark:hover:border-emerald-900/50"
                            onClick={() => setSelectedProduct(item)}
                        >
                            {/* Image Container */}
                            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 dark:bg-slate-800 mb-5 border border-slate-50 dark:border-slate-700">
                                <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="absolute bottom-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg">
                                        <Plus size={20} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="px-2">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{item.name}</h3>
                                    <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap border border-emerald-100 dark:border-emerald-900/50">
                                        ฿{item.price.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 text-sm line-clamp-2 font-light">
                                    {item.description || "ของที่ระลึกคุณภาพดี ออกแบบพิเศษสำหรับงานนี้โดยเฉพาะ"}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* --- Modal --- */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[60] flex items-center justify-center p-4"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] relative transition-colors border border-white/20 dark:border-slate-800"
                        >
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/80 dark:bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-slate-500 dark:text-white hover:text-slate-800 z-10 shadow-sm transition-transform hover:scale-110"
                            >
                                <X size={20} />
                            </button>

                            <div className="h-72 w-full bg-slate-100 dark:bg-slate-800 relative">
                                <img src={getImageUrl(selectedProduct.image)} className="w-full h-full object-cover" alt={selectedProduct.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-black/40 to-transparent"></div>
                            </div>

                            <div className="p-8">
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 leading-tight">{selectedProduct.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-base mb-8 font-light leading-relaxed">
                                    {selectedProduct.description || 'รายละเอียดสินค้าเพิ่มเติมจะแสดงที่นี่ สินค้าคุณภาพดี ออกแบบมาเพื่อคุณ'}
                                </p>

                                {/* Quantity Selector */}
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-slate-400 dark:text-slate-500 font-bold text-sm uppercase tracking-wider">จำนวนชิ้น</span>
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <button onClick={decreaseQty} className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 transition active:scale-95 text-slate-600 dark:text-white">
                                            <Minus size={18} />
                                        </button>
                                        <span className="text-xl font-bold w-8 text-center text-slate-800 dark:text-white">{quantity}</span>
                                        <button onClick={increaseQty} className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-emerald-600 text-white flex items-center justify-center hover:bg-slate-700 dark:hover:bg-emerald-700 transition active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">ยอดรวม</span>
                                        <span className="text-2xl font-black text-slate-800 dark:text-white">฿{(selectedProduct.price * quantity).toLocaleString()}</span>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95 hover:-translate-y-1"
                                    >
                                        <ShoppingBag size={20} /> เพิ่มลงตะกร้า
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

export default SouvenirShop;