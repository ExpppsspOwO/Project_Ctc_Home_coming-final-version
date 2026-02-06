import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config'; 
import { useToast } from '../context/ToastContext'; 

import ZoneList from './ZoneList';
import TableGrid from './TableGrid';
import MiniMap from './MiniMap';
import BookingBar from './BookingBar';

const BookingSystem = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeZone, setActiveZone] = useState(null);
    const [selectedTables, setSelectedTables] = useState([]);
    const [isMapVisible, setIsMapVisible] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchTables();
        const interval = setInterval(() => { fetchTables(true); }, 5000); 
        return () => clearInterval(interval);
    }, []);

    const fetchTables = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const res = await fetch(`${API_BASE_URL}/tables`);
            if (!res.ok) throw new Error('Connect Failed');
            const data = await res.json();
            setTables(data);
        } catch (error) {
            console.error(error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const toggleTableSelection = (table) => {
        if (table.status !== 'available') return;
        setSelectedTables(prev => {
            const isSelected = prev.find(t => t._id === table._id);
            return isSelected ? prev.filter(t => t._id !== table._id) : [...prev, table];
        });
    };

    const handleBooking = async () => {
        if (selectedTables.length === 0) return;
        const token = localStorage.getItem('token');
        if (!token) {
            addToast('กรุณาเข้าสู่ระบบก่อนจองโต๊ะ', 'warning');
            setTimeout(() => window.location.href = '/auth', 1500); 
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tables: selectedTables.map(t => t._id) })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'จองไม่สำเร็จ');

            addToast(`จองสำเร็จ ${selectedTables.length} โต๊ะ! 🎉`, 'success');
            setSelectedTables([]);
            fetchTables(); 
            
            window.dispatchEvent(new CustomEvent('ORDER_CREATED', { 
            detail: { url: '/MyBookings',
                status: data.booking?.status || 'pending'
             }}))

        } catch (error) {
            addToast(error.message, 'error');
        }
    };

    const tablesByZone = tables.reduce((acc, table) => {
        if (!acc[table.zone]) acc[table.zone] = [];
        acc[table.zone].push(table);
        return acc;
    }, {});

    const currentZoneTables = activeZone ? tablesByZone[activeZone] || [] : [];

    if (loading && tables.length === 0) return (
        <div className="flex flex-col justify-center items-center h-64 text-emerald-600 dark:text-emerald-400 font-bold gap-3">
            <Sparkles className="animate-spin" size={32} />
            <p>กำลังโหลดแผนผังที่นั่ง...</p>
        </div>
    );

    return (
        <div className="w-full relative">
            
            {activeZone && !isMapVisible && (
                <motion.button 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    onClick={() => setIsMapVisible(true)} 
                    className="absolute right-0 -top-12 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                    <Map size={20} /> <span className="text-xs font-bold ml-1">แผนที่</span>
                </motion.button>
            )}

            <AnimatePresence mode="wait">
                {!activeZone ? (
                    <ZoneList key="zones" tablesByZone={tablesByZone} onSelectZone={setActiveZone} selectedTables={selectedTables} />
                ) : (
                    <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                        <button onClick={() => setActiveZone(null)} className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-800 px-5 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 transition-colors font-bold text-sm">
                            <ArrowLeft size={16} /> เลือกโซนอื่น
                        </button>
                        
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            <div className="flex-1 w-full">
                                <TableGrid 
                                    tables={currentZoneTables} 
                                    activeZone={activeZone} 
                                    selectedTables={selectedTables} 
                                    onToggleSelect={toggleTableSelection} 
                                />
                            </div>

                            <div className={`transition-all duration-500 ease-in-out ${isMapVisible ? 'w-full lg:w-80 opacity-100' : 'w-0 h-0 opacity-0 lg:w-0 overflow-hidden'}`}>
                                <MiniMap tables={currentZoneTables} isVisible={isMapVisible} onClose={() => setIsMapVisible(false)} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedTables.length > 0 && (
                <BookingBar 
                    selectedTables={selectedTables} 
                    onCancel={() => setSelectedTables([])} 
                    onConfirm={handleBooking} 
                />
            )}
        </div>
    );
};

export default BookingSystem;