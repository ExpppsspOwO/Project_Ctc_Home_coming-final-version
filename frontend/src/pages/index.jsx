// src/pages/index.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, MapPin, Music, Sparkles, ShoppingBag,
    Clock, Users, Camera, Utensils, Heart, MessageCircle, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { API_BASE_URL } from '../config';

// Import Components
import BookingSystem from '../components/BookingSystem';
import HeroBackground from '../components/HeroBackground';
import SectionHeader from '../components/SectionHeader';
import AgendaItem from '../components/AgendaItem';
import FAQItem from '../components/FAQItem';
import Footer from '../components/Footer';

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const iconMap = { Users, Utensils, Music, Heart, Star, Clock, Camera, MapPin };

const Index = () => {
    const { config = {} } = useConfig();
    
    const scrollToBooking = () => {
        const section = document.getElementById('booking-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    };

    const getImageUrl = (src) => {
        if (!src) return "https://placehold.co/600x400?text=No+Image";
        if (src.startsWith('http') || src.startsWith('blob:')) return src;
        const serverUrl = API_BASE_URL.replace('/api', ''); 
        return `${serverUrl}/uploads/site/photos/${src}`;
    };

    const hero = config?.hero || {};
    const line1 = hero.line1 || { show: false }; 
    const line2 = hero.line2 || { show: false };
    const line3 = hero.line3 || { show: false };
    const subText = hero.subText || { show: false };
    
    const stats = config?.stats || { show: false, items: [] };
    const agenda = config?.agenda || { show: false, items: [] };
    const gallery = config?.gallery || { show: false, items: [] };
    const faq = config?.faq || { show: false, items: [] };
    
    const system = config?.system || { booking: true, purchasing: true };

    const auroraClass = "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 dark:from-blue-400 dark:via-green-300 dark:to-indigo-300 inline-block";

    return (
        <div id="top" className="relative w-full max-w-full overflow-x-clip transition-colors duration-300 bg-white dark:bg-slate-950">
            
            {/* 1. HERO SECTION */}
            <section className="relative z-10 pt-32 pb-40 md:pt-56 md:pb-72 w-full">
                <HeroBackground />
                <div className="max-w-7xl mx-auto px-6 text-center relative z-20">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-8 shadow-sm backdrop-blur-sm">
                            <Sparkles size={16} /> Official Event
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tight drop-shadow-sm break-words">
                            
                            {line1.show && <span className="dark:text-white" style={!line1.color ? {} : { color: line1.color }}>{line1.text}</span>}
                            {line1.show && <br />}
                            
                            {line2.show && (
                                <span 
                                    className={line2.aurora ? auroraClass : 'dark:text-white'}
                                    style={!line2.aurora && line2.color ? { color: line2.color } : {}}
                                >
                                    {line2.text}
                                </span>
                            )}
                            {line2.show && <br />}
                            
                            {line3.show && <span className="dark:text-white" style={!line3.color ? {} : { color: line3.color }}>{line3.text}</span>}
                        </h1>
                        
                        {subText.show && (
                            <p className="text-lg md:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light px-2">
                                {subText.text}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center px-6">
                            {system.booking && (
                                <button onClick={scrollToBooking} className="px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-full font-bold text-xl shadow-2xl hover:bg-slate-800 dark:hover:bg-blue-700 transition flex items-center justify-center gap-3 w-full sm:w-auto hover:-translate-y-1">
                                    จองโต๊ะเลย <ArrowRight size={24} />
                                </button>
                            )}
                            {system.purchasing && (
                                <Link to="/souvenirshop" className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-full font-bold text-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-3 shadow-lg w-full sm:w-auto hover:-translate-y-1">
                                    <ShoppingBag size={24} /> ของที่ระลึก
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. STATS SECTION */}
            {stats.show && stats.items.length > 0 && (
                <div className="w-full px-4 md:px-6 relative z-10 mb-32 -mt-20 md:-mt-40">
                    <div className="max-w-7xl mx-auto">
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {stats.items.map((stat, idx) => {
                                const IconComponent = iconMap[stat.icon] || Star;
                                return (
                                    <motion.div
                                        key={stat.id || idx}
                                        variants={fadeInUp}
                                        className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl text-center transform transition-transform hover:-translate-y-2 border border-slate-100/50 dark:border-slate-700/50 relative overflow-hidden dark:bg-slate-800"
                                        style={stat.color ? { backgroundColor: stat.color } : {}} // ถ้ามีสี override จะใช้สีนั้น (Dark mode จะถูกทับถ้า User เลือกสีพื้นหลังมา)
                                    >
                                        {/* ถ้ามีสีพื้นหลังที่ User เลือกมา เราอาจจะต้องระวังเรื่องสี Text นิดหน่อย */}
                                        <div className="inline-flex p-4 rounded-2xl mb-4 shadow-inner bg-white/40 backdrop-blur-sm text-slate-800 dark:text-slate-900">
                                            <IconComponent size={32} />
                                        </div>
                                        <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-900 mb-2">{stat.val}</h3>
                                        <p className="text-slate-600 dark:text-slate-800 text-sm md:text-base font-bold uppercase tracking-wider">{stat.label}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            )}

            {/* 3. AGENDA */}
            {agenda.show && agenda.items.length > 0 && (
                <section id="agenda" className="py-24 md:py-40 bg-white dark:bg-slate-900 relative overflow-hidden mb-24 transition-colors">
                    <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                        <SectionHeader title="กำหนดการ" subtitle="Timeline ความสนุกตลอดคืน" icon={Clock} />
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="relative space-y-12">
                            {agenda.items.map((item, idx) => (
                                <AgendaItem key={idx} item={item} isEven={idx % 2 === 0} />
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* 4. GALLERY */}
            {gallery.show && gallery.items.length > 0 && (
                <section id="gallery" className="py-24 w-full overflow-hidden bg-gray-50 dark:bg-slate-950 transition-colors">
                    <div className="max-w-7xl mx-auto px-6 text-center mb-16"><SectionHeader title="Memory Lane" subtitle="ภาพบรรยากาศที่คุณคิดถึง" icon={Camera} /></div>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="w-full overflow-hidden">
                        <motion.div className="flex gap-6 md:gap-8" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 50, ease: "linear" }} style={{ width: "max-content" }}>
                            {[...gallery.items, ...gallery.items].map((img, idx) => (
                                <div key={idx} className="w-[300px] h-[200px] md:w-[600px] md:h-[400px] rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 shadow-xl cursor-pointer border border-gray-200 dark:border-slate-800">
                                    <img src={getImageUrl(img)} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Gallery" onError={(e) => { e.target.src = "https://placehold.co/600x400?text=No+Image"; }} />
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </section>
            )}

            {/* 5. BOOKING */}
            {system.booking && (
                <section id="booking-section" className="py-24 md:py-40 bg-slate-50 dark:bg-slate-950 w-full px-4 transition-colors">
                    <div className="max-w-7xl mx-auto">
                        <SectionHeader title="จองโต๊ะ" subtitle="เลือกที่นั่งที่คุณต้องการ" icon={MapPin} />
                        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 p-2 md:p-4 transition-colors">
                            <BookingSystem /> 
                        </motion.div>
                    </div>
                </section>
            )}

            {/* 6. FAQ */}
            {faq.show && faq.items.length > 0 && (
                <section id="faq" className="py-24 w-full px-4 bg-white dark:bg-slate-900 transition-colors">
                    <div className="max-w-4xl mx-auto">
                        <SectionHeader title="คำถามที่พบบ่อย" subtitle="ข้อมูลที่คุณอาจสงสัย" />
                        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 p-8 md:p-12 space-y-2 mb-16 transition-colors">
                            {faq.items.map((item, idx) => ( <FAQItem key={idx} question={item.question} answer={item.answer} /> ))}
                        </motion.div>

                       {config?.line?.show && (
                            <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" className="text-center">
                                <Link to="/contact-line" className="inline-flex items-center gap-3 bg-[#06C755] text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-green-200 dark:shadow-none hover:shadow-xl hover:bg-[#05b34c] transition-all text-lg">
                                    <MessageCircle size={24} /> 
                                    <span>แอดไลน์แจ้งปัญหา</span> 
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default Index;