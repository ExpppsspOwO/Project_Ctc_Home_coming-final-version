// src/components/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Globe } from 'lucide-react';
import { Link } from 'react-router-dom'; // ✅ Import Link
import { useConfig } from '../context/ConfigContext';

// Helper: เติม https:// ถ้าไม่มี
const getLink = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

const Footer = () => {
    const { config } = useConfig();

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!config.footer?.show) return null;

    return (
        <motion.footer 
            id="contact"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900 text-slate-300 pt-20 pb-10 relative z-20 w-full overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                            <Sparkles className="text-emerald-400" size={32} /> 
                            {config.branding?.siteName || 'CTC Homecoming'}
                        </h3>
                        {config.footer?.text?.show && (
                            <p className="text-slate-400 leading-relaxed mb-8 max-w-md text-lg">
                                {config.footer.text.content || 'งานคืนสู่เหย้าครั้งยิ่งใหญ่ที่สุดแห่งปี กลับมาพบปะเพื่อนเก่า รำลึกความหลัง'}
                            </p>
                        )}
                        
                        {/* Social Links */}
                        <div className="flex gap-4">
                            {config.footer?.social?.facebook?.show && config.footer.social.facebook.url && (
                                <a href={getLink(config.footer.social.facebook.url)} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all"><Facebook size={18} /></a>
                            )}
                            {config.footer?.social?.instagram?.show && config.footer.social.instagram.url && (
                                <a href={getLink(config.footer.social.instagram.url)} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-all"><Instagram size={18} /></a>
                            )}
                            {config.footer?.social?.twitter?.show && config.footer.social.twitter.url && (
                                <a href={getLink(config.footer.social.twitter.url)} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-all"><Twitter size={18} /></a>
                            )}
                            {config.footer?.social?.website?.show && config.footer.social.website.url && (
                                <a href={getLink(config.footer.social.website.url)} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"><Globe size={18} /></a>
                            )}
                        </div>
                    </div>

                    {/* เมนูลัด */}
                    <div>
                        <h4 className="text-white font-bold mb-8 text-xl">เมนูลัด</h4>
                        <ul className="space-y-4 text-lg">
                            <li><button onClick={() => scrollToSection('top')} className="hover:text-emerald-400 transition text-left">หน้าแรก</button></li>
                            {config.agenda?.show && <li><button onClick={() => scrollToSection('agenda')} className="hover:text-emerald-400 transition text-left">กำหนดการ</button></li>}
                            {config.system?.booking && <li><button onClick={() => scrollToSection('booking-section')} className="hover:text-emerald-400 transition text-left">จองโต๊ะ</button></li>}
                            {config.faq?.show && <li><button onClick={() => scrollToSection('faq')} className="hover:text-emerald-400 transition text-left">คำถามที่พบบ่อย</button></li>}
                            <li><Link to="/contact-line" className="hover:text-emerald-400 transition text-left">ติดต่อผ่านไลน์</Link></li>
                        </ul>
                    </div>

                    {/* ข้อมูลติดต่อ */}
                    <div>
                        <h4 className="text-white font-bold mb-8 text-xl">ติดต่อเรา</h4>
                        <ul className="space-y-5 text-lg">
                            {config.footer?.contact?.address?.show && (
                                <li className="flex items-start gap-4">
                                    <MapPin size={24} className="text-emerald-400 shrink-0 mt-1" />
                                    <span>{config.footer.contact.address.text}</span>
                                </li>
                            )}
                            {config.footer?.contact?.phone?.show && (
                                <li className="flex items-center gap-4">
                                    <Phone size={24} className="text-emerald-400 shrink-0" />
                                    <span>{config.footer.contact.phone.text}</span>
                                </li>
                            )}
                            {config.footer?.contact?.email?.show && (
                                <li className="flex items-center gap-4">
                                    <Mail size={24} className="text-emerald-400 shrink-0" />
                                    <span>{config.footer.contact.email.text}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-10 text-center text-base text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {config.branding?.siteName}. All rights reserved.</p>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;